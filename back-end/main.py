from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from typing import Optional
from openai import OpenAI
import asyncio
import uvicorn
import os

from models import Base, User
from database import get_db, engine

# ------------------- CONFIG -------------------
SECRET_KEY = os.getenv("SECRET_KEY", "SUPER_SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# OpenRouter client
openrouter_client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

# Create tables
Base.metadata.create_all(bind=engine)

# ------------------- PLAN CONFIG -------------------
PLAN_CREDITS = {
    "free": 10,
    "starter": 500,
    "pro": 2500,
    "flexible": None,
}
FLEXIBLE_COST_PER_30 = 0.99

# Gumroad product mapping
GUMROAD_PRODUCTS = {
    os.getenv("GUMROAD_STARTER_ID", "uivryd"): "starter",
    os.getenv("GUMROAD_PRO_ID", "dnvjmb"): "pro",
    os.getenv("GUMROAD_FLEXIBLE_ID", "ntaktl"): "flexible",
}

# ------------------- SCHEMAS -------------------
class UserRegister(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class PromptRequest(BaseModel):
    prompt: str
    chat_name: Optional[str] = None

class UpgradeRequest(BaseModel):
    plan_name: str

# ------------------- APP -------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------- HELPERS -------------------
def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user_by_email(email: str, db: Session) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid token")

    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication")

    user = get_user_by_email(email, db)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

def decrement_credit_if_applicable(user: User, db: Session):
    if user.plan in ("starter", "pro", "free"):
        if user.credit_remaining <= 0:
            raise HTTPException(status_code=403, detail="No credits left. Upgrade your plan.")
        user.credit_remaining -= 1
        db.commit()
        db.refresh(user)
    elif user.plan == "flexible":
        if not user.credit_remaining:
            user.credit_remaining = 0
        user.credit_remaining += 1
        db.commit()
        db.refresh(user)

# ------------------- ROUTES: AUTH -------------------
@app.post("/api/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    if get_user_by_email(user.email, db):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password, plan="free", credit_remaining=PLAN_CREDITS["free"])
    db.add(new_user)
    db.commit()
    return {"message": "User registered successfully", "email": new_user.email}

@app.post("/api/login", response_model=Token)
def login(user: UserRegister, db: Session = Depends(get_db)):
    db_user = get_user_by_email(user.email, db)
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(data={"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/profile")
def profile(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "plan": current_user.plan,
        "credit_remaining": current_user.credit_remaining
    }

@app.get("/api/me")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "plan": user.plan
    }

# ------------------- ROUTES: BILLING -------------------
@app.get("/api/plans")
def get_plans():
    return {
        "free": {"credits": PLAN_CREDITS["free"]},
        "starter": {"credits": PLAN_CREDITS["starter"]},
        "pro": {"credits": PLAN_CREDITS["pro"]},
        "flexible": {"credits": "Unlimited", "price_per_30": FLEXIBLE_COST_PER_30}
    }

@app.post("/api/gumroad-webhook")
async def gumroad_webhook(request: Request, db: Session = Depends(get_db)):
    data = await request.form()
    email = data.get("email")
    product_id = data.get("product_id")
    success = data.get("success")

    if not success or not email or product_id not in GUMROAD_PRODUCTS:
        return JSONResponse({"error": "Invalid webhook"}, status_code=400)

    plan_name = GUMROAD_PRODUCTS[product_id]
    user = get_user_by_email(email, db)
    if not user:
        return JSONResponse({"error": "User not found"}, status_code=404)

    if plan_name in ("starter", "pro"):
        user.plan = plan_name
        user.credit_remaining = PLAN_CREDITS[plan_name]
    elif plan_name == "flexible":
        user.plan = "flexible"
        if not user.credit_remaining:
            user.credit_remaining = 0

    db.commit()
    return {"message": f"{email} upgraded to {plan_name}"}

# ------------------- ROUTES: GENERATION -------------------
@app.post("/api/generate_fast")
async def generate_fast(request: PromptRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = get_user_by_email(current_user.email, db)
    if user.plan in ("starter", "pro", "free") and (user.credit_remaining <= 0):
        return JSONResponse({"error": "No credits left. Upgrade your plan.", "redirect": "/pricing"}, status_code=403)

    output_text = await call_openrouter(request.prompt, user.plan)
    decrement_credit_if_applicable(user, db)
    return {"output": output_text, "credit_remaining": user.credit_remaining, "plan": user.plan}

async def call_openrouter(prompt: str, plan: str) -> str:
    resp = await asyncio.to_thread(lambda: openrouter_client.chat.completions.create(
        model="mistralai/mistral-7b-instruct:free",  # ✅ stable free model
        messages=[{"role": "user", "content": prompt}],
        max_tokens=2048,   # increase length if you want longer generations
        temperature=0.7
    ))
    return resp.choices[0].message.content


# ------------------- MAIN -------------------
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)