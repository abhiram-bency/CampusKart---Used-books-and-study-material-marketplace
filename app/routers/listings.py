from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Listing, User, RoleEnum
from app.schemas import ListingCreate, ListingUpdate, ListingResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/listings", tags=["Listings"])

@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_listing = Listing(**listing.dict(), owner_id=current_user.id)
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    return new_listing

@router.get("", response_model=List[ListingResponse])
def get_listings(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    listings = db.query(Listing).offset(skip).limit(limit).all()
    return listings

@router.get("/{listing_id}", response_model=ListingResponse)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.put("/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: int,
    listing_update: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if listing.owner_id != current_user.id and current_user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not authorized to update this listing")
    
    update_data = listing_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(listing, key, value)
    
    db.commit()
    db.refresh(listing)
    return listing

@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if listing.owner_id != current_user.id and current_user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")
    
    db.delete(listing)
    db.commit()
    return None
