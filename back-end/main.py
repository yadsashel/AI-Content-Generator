from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import sqlite3
import os
import asyncio
from dotenv import load_dotenv
from openai import OpenAI
import uvicorn

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

# ------------------- DATABASE -------------------
conn = sqlite3.connect("users.db", check_same_thread=False)
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL
)
""")
conn.commit()

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

def get_user(email: str):
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    if row:
        return {"id": row[0], "email": row[1], "hashed_password": row[2]}
    return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication")
    user = get_user(email)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

# ------------------- ROUTES -------------------
@app.post("/api/register")
def register(user: UserRegister):
    if get_user(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    cursor.execute(
        "INSERT INTO users (email, hashed_password) VALUES (?, ?)",
        (user.email, hashed_password)
    )
    conn.commit()
    return {"message": "User registered successfully!", "email": user.email}

@app.post("/api/login", response_model=Token)
def login(user: UserRegister):
    db_user = get_user(user.email)
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(data={"sub": db_user["email"]})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/profile")
def profile(current_user: dict = Depends(get_current_user)):
    return {"email": current_user["email"]}

@app.put("/api/profile")
def update_profile(update: UserUpdate, current_user: dict = Depends(get_current_user)):
    user = get_user(current_user["email"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_email = update.email
    new_password = update.password

    if new_email != user["email"] and get_user(new_email):
        raise HTTPException(status_code=400, detail="Email already in use")

    hashed_password = user["hashed_password"]
    if new_password:
        hashed_password = get_password_hash(new_password)

    cursor.execute(
        "UPDATE users SET email = ?, hashed_password = ? WHERE id = ?",
        (new_email, hashed_password, user["id"])
    )
    conn.commit()
    return {"message": "Profile updated successfully!", "email": new_email}

@app.get("/api/dashboard")
def dashboard(current_user: dict = Depends(get_current_user)):
    return {"message": f"Welcome to your dashboard, {current_user['email']}"}

@app.post("/api/logout")
def logout():
    return {"message": "Logged out successfully"}

# ------------------- OPENAI CONTENT GENERATION -------------------
async def generate_with_retry(prompt: str, retries: int = 3):
    for attempt in range(retries):
        try:
            response = await asyncio.to_thread(
                lambda: co.chat(
                    message=prompt,
                    model="command",
                    temperature=0.3
                )
            )
            return response.text
        except Exception as e:  # <-- just catch generic Exception
            print(f"Attempt {attempt+1} failed: {e}")
            if attempt == retries - 1:
                raise
            await asyncio.sleep(1)  # wait before retry

@app.post("/api/generate_fast")
async def generate_fast(request: PromptRequest):
    try:
        # Make the chat request to OpenRouter/Mistral
        response = openrouter_client.chat.completions.create(
            model="mistralai/mistral-small-3.2-24b-instruct:free",
            messages=[
                {"role": "user", "content": request.prompt}
            ],
            max_tokens=256,
            temperature=0.7
        )

        # Extract the generated text
        generated_text = response.choices[0].message.content
        return {"output": generated_text}

    except Exception as e:
        print("OpenRouter error:", e)
        return {"error": str(e)}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # Render will inject PORT
    uvicorn.run("main:app", host="0.0.0.0", port=port)