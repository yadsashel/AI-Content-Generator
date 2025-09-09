import asyncio
import json
import os
import uvicorn
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from openai import OpenAI

from models import Base, User, Post
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
    post_id: Optional[int] = None

class PostCreate(BaseModel):
    title: Optional[str] = "Untitled Chat"
    messages: str  # store JSON string of chat history

class PostUpdate(BaseModel):
    title: Optional[str] = None
    messages: Optional[str] = None

# New schema for social media posting
class SocialPostRequest(BaseModel):
    platform: str  # e.g., "facebook", "twitter", "linkedin"
    content: str
    post_id: int

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

@app.get("/api/posts")
def get_posts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    posts = db.query(Post).filter(Post.user_id == current_user.id).order_by(Post.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "messages": p.messages,
            "created_at": p.created_at,
        }
        for p in posts
    ]


@app.post("/api/posts")
def create_post(post: PostCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_post = Post(
        user_id=current_user.id,
        title=post.title or "Untitled Chat",
        messages=post.messages
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return {
        "id": new_post.id,
        "title": new_post.title,
        "messages": new_post.messages,
        "created_at": new_post.created_at,
    }


@app.put("/api/posts/{post_id}")
def update_post(post_id: int, post: PostUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_post = db.query(Post).filter(Post.id == post_id, Post.user_id == current_user.id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.title:
        db_post.title = post.title
    if post.messages:
        db_post.messages = post.messages
    db.commit()
    db.refresh(db_post)
    return {
        "id": db_post.id,
        "title": db_post.title,
        "messages": db_post.messages,
        "created_at": db_post.created_at,
    }


@app.get("/api/posts/{post_id}")
def get_single_post(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_post = db.query(Post).filter(Post.id == post_id, Post.user_id == current_user.id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    return {
        "id": db_post.id,
        "title": db_post.title,
        "messages": db_post.messages,
        "created_at": db_post.created_at,
    }


@app.delete("/api/posts/{post_id}")
def delete_post(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_post = db.query(Post).filter(Post.id == post_id, Post.user_id == current_user.id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.delete(db_post)
    db.commit()
    return {"message": "Post deleted"}


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
@app.post("/api/generate_stream")
async def generate_stream(request: PromptRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check for credits BEFORE starting the generation
    if current_user.plan in ("starter", "pro", "free") and current_user.credit_remaining <= 0:
        return JSONResponse({"error": "No credits left. Upgrade your plan.", "redirect": "/pricing"}, status_code=403)

    # If it's a new post, create it first
    if request.post_id is None:
        new_post = Post(
            user_id=current_user.id,
            title=request.prompt[:30],
            messages=json.dumps([{"role": "user", "content": request.prompt}])
        )
        db.add(new_post)
        db.commit()
        db.refresh(new_post)
        post_id = new_post.id
    else:
        post_id = request.post_id

    # Get the existing post from the session
    db_post = db.query(Post).filter(Post.id == post_id, Post.user_id == current_user.id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    messages_to_send = json.loads(db_post.messages)
    messages_to_send.append({"role": "user", "content": request.prompt})

    # Add a system prompt to guide the AI's response style, based on the user's request
    system_prompt = {
        "role": "system",
        "content": "You are a highly professional, well-organized, and smart assistant. Your responses should be structured like a polished article or blog post, using Markdown for clear headings (like ## and ###), bolding for emphasis (**bold text**), and logical paragraph breaks. The user is expecting a perfect, structured, and visually appealing response. Based on the user's query, use appropriate icons and emojis to enhance the answer, as long as it maintains a professional tone."
    }
    messages_to_send.insert(0, system_prompt)

    async def stream_output():
        full_response = ""
        try:
            response = openrouter_client.chat.completions.create(
                model="mistralai/mistral-small-3.2-24b-instruct:free",
                messages=messages_to_send,
                max_tokens=2048,
                temperature=0.7,
                stream=True
            )
            for chunk in response:
                content = chunk.choices[0].delta.content
                if content:
                    full_response += content
                    yield content.encode("utf-8")
        except Exception as e:
            print(f"Streaming error: {e}")
            yield "❌ Error: Something went wrong with the AI generation.".encode("utf-8")
        finally:
            # We need a new database session for the final update to avoid issues
            # with the session used by FastAPI's dependency injection
            new_db = next(get_db())
            try:
                user_to_update = new_db.query(User).filter(User.id == current_user.id).first()
                post_to_update = new_db.query(Post).filter(Post.id == post_id, Post.user_id == current_user.id).first()

                if not user_to_update or not post_to_update:
                    print("Error: User or Post not found in new session during update.")
                    return

                # Append the full user and assistant messages to the chat history
                messages = json.loads(post_to_update.messages)
                messages.append({"role": "user", "content": request.prompt})
                messages.append({"role": "assistant", "content": full_response})
                post_to_update.messages = json.dumps(messages)
                
                if user_to_update.plan in ("starter", "pro", "free"):
                    user_to_update.credit_remaining -= 1
                elif user_to_update.plan == "flexible":
                    user_to_update.credit_remaining = (user_to_update.credit_remaining or 0) + 1

                new_db.commit()
                new_db.refresh(user_to_update)
                new_db.refresh(post_to_update)
            except Exception as e:
                new_db.rollback()
                print(f"Database update error in finally block: {e}")
            finally:
                new_db.close()

    return StreamingResponse(stream_output(), media_type="text/plain")


# ------------------- ROUTES: SOCIAL MEDIA -------------------
# This is a placeholder for social media posting logic.
# it would need to implement OAuth 2.0 flows for each platform
# to securely authenticate and get user-specific access tokens.
@app.post("/api/social/post")
def post_to_social(request: SocialPostRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Here it would add the logic to interact with each social media platform's API
    # based on the 'platform' field in the request.
    try:
        # For demonstration purposes, we'll just check the platform and return a success message.
        if request.platform == "facebook":
            # facebook_api.post(request.content)
            # it would need to add error handling and proper API calls here.
            message = f"✅ Content successfully posted to Facebook for user {current_user.email}."
        elif request.platform == "twitter":
            # twitter_api.post_tweet(request.content)
            message = f"✅ Content successfully posted to Twitter for user {current_user.email}."
        elif request.platform == "linkedin":
            # linkedin_api.share(request.content)
            message = f"✅ Content successfully posted to LinkedIn for user {current_user.email}."
        elif request.platform == "instagram":
            # instagram_api.post(request.content)
            message = f"✅ Content successfully posted to Instagram for user {current_user.email}."
        else:
            raise HTTPException(status_code=400, detail="Invalid social media platform specified.")

        # Update the post in the database to reflect the social media share
        db_post = db.query(Post).filter(Post.id == request.post_id, Post.user_id == current_user.id).first()
        if db_post:
            messages = json.loads(db_post.messages)
            messages.append({"role": "system", "content": message})
            db_post.messages = json.dumps(messages)
            db.commit()
            db.refresh(db_post)

        return {"message": message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to post to social media: {e}")


# ------------------- MAIN -------------------
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)