from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class RoleEnum(str, enum.Enum):
    student = "student"
    admin = "admin"

class CategoryEnum(str, enum.Enum):
    book = "book"
    hardware = "hardware"

class OrderStatusEnum(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    cancelled = "cancelled"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.student, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    listings = relationship("Listing", back_populates="owner", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="buyer", cascade="all, delete-orphan")

class Listing(Base):
    __tablename__ = "listings"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    category = Column(Enum(CategoryEnum), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="listings")
    orders = relationship("Order", back_populates="listing", cascade="all, delete-orphan")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    status = Column(Enum(OrderStatusEnum), default=OrderStatusEnum.pending, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    buyer = relationship("User", back_populates="orders")
    listing = relationship("Listing", back_populates="orders")
