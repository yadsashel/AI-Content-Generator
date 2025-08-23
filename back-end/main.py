from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import json
import asyncio
from dotenv import load_dotenv
from openai import OpenAI
import uvicorn
from sqlalchemy.orm import Session
from database import get_db, engine
from models import Base, User, Post

# ------------------- LOAD ENV -------------------
load_dotenv()

# ------------------- CONFIG -------------------
SECRET_KEY = os.getenv("SECRET_KEY", "SUPER_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
FRONTEND_URL = os.getenv("FRONTEND_URL")

# Initialize OpenRouter client
openrouter_client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

# Create tables if not exist
Base.metadata.create_all(bind=engine)

# ------------------- MODELS -------------------
class UserRegister(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class PromptRequest(BaseModel):
    prompt: str

class UserUpdate(BaseModel):
    email: EmailStr
    password: str = None

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

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user_by_email(email: str, db: Session):
    return db.query(User).filter(User.email == email).first()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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

# ------------------- ROUTES -------------------
@app.post("/api/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    if get_user_by_email(user.email, db):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully!", "email": new_user.email}

@app.post("/api/login", response_model=Token)
def login(user: UserRegister, db: Session = Depends(get_db)):
    db_user = get_user_by_email(user.email, db)
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(data={"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/profile")
def profile(current_user: User = Depends(get_current_user)):
    return {"email": current_user.email}

@app.put("/api/profile")
def update_profile(update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = get_user_by_email(current_user.email, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if update.email != user.email and get_user_by_email(update.email, db):
        raise HTTPException(status_code=400, detail="Email already in use")

    user.email = update.email
    if update.password:
        user.hashed_password = get_password_hash(update.password)

    db.commit()
    db.refresh(user)
    return {"message": "Profile updated successfully!", "email": user.email}

@app.get("/api/dashboard")
def dashboard(current_user: User = Depends(get_current_user)):
    return {"message": f"Welcome to your dashboard, {current_user.email}"}

@app.post("/api/logout")
def logout():
    return {"message": "Logged out successfully"}

# ------------------- OPENAI CONTENT GENERATION -------------------
async def generate_with_retry(prompt: str, retries: int = 3):
    for attempt in range(retries):
        try:
            response = await asyncio.to_thread(
                lambda: openrouter_client.chat.completions.create(
                    model="mistralai/mistral-small-3.2-24b-instruct:free",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=1024,
                    temperature=0.7
                )
            )
            # Return the full text as JSON (safe for your current frontend)
            return {"output": response.choices[0].message.content}

        except Exception as e:
            print(f"Attempt {attempt+1} failed: {e}")
            if attempt == retries - 1:
                return {"error": str(e)}
            await asyncio.sleep(1)

@app.post("/api/generate_fast")
async def generate_fast(request: PromptRequest):
    return await generate_with_retry(request.prompt)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)