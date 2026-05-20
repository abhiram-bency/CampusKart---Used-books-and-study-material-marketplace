from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Order, Listing, User
from app.schemas import OrderCreate, OrderResponse, OrderDetailResponse
from app.dependencies import get_current_user, require_admin
from app.tasks import send_order_notification

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == order.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if listing.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot buy your own listing")
    
    new_order = Order(buyer_id=current_user.id, listing_id=order.listing_id)
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Trigger background task
    send_order_notification.delay(new_order.id)
    
    return new_order

@router.get("/me", response_model=List[OrderDetailResponse])
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).filter(Order.buyer_id == current_user.id).all()
    return orders

@router.get("", response_model=List[OrderDetailResponse])
def get_all_orders(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).all()
    return orders
