from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from app.models import RoleEnum, CategoryEnum, OrderStatusEnum

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(min_length=6)
    role: Optional[RoleEnum] = RoleEnum.student

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: RoleEnum
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Listing Schemas
class ListingBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float = Field(gt=0)
    category: CategoryEnum

class ListingCreate(ListingBase):
    pass

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category: Optional[CategoryEnum] = None

class ListingResponse(ListingBase):
    id: int
    owner_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    listing_id: int

class OrderResponse(BaseModel):
    id: int
    buyer_id: int
    listing_id: int
    status: OrderStatusEnum
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderDetailResponse(OrderResponse):
    listing: ListingResponse
    
    class Config:
        from_attributes = True
