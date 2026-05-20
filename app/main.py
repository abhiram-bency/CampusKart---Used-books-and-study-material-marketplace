from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import users, listings, orders
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
#Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CampusKart API",
    description="Student Marketplace Backend API for buying and selling used books and academic hardware",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(listings.router)
app.include_router(orders.router)

@app.get("/", status_code=status.HTTP_200_OK)
def root():
    return {"message": "CampusKart API is running", "status": "healthy"}

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    return {"status": "healthy", "service": "campuskart-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
