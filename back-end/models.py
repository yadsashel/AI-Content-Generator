from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    plan = Column(String, default="free")
    credit_remaining = Column(Float, default=10)
    stripe_customer_id = Column(String, nullable=True)  # NEW
    subscription_id = Column(String, nullable=True)     # NEW
    subscription_status = Column(String, nullable=True) # NEW
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to usage records
    usage_records = relationship("UsageRecord", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")

class UsageRecord(Base):
    """Track usage for flexible plan billing"""
    __tablename__ = "usage_records"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prompt = Column(Text, nullable=False)
    tokens_used = Column(Integer, default=0)
    cost = Column(Float, default=0.09)  # $0.09 per generation
    created_at = Column(DateTime, default=datetime.utcnow)
    billed = Column(Boolean, default=False)  # Whether this has been billed yet
    
    user = relationship("User", back_populates="usage_records")

class Transaction(Base):
    """Track all payments and charges"""
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stripe_payment_intent_id = Column(String, nullable=True)
    amount = Column(Float, nullable=False)  # in dollars
    currency = Column(String, default="usd")
    status = Column(String, nullable=False)  # succeeded, pending, failed
    plan_name = Column(String, nullable=True)  # which plan was purchased
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="transactions")

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)