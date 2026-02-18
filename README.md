📚 CampusKart – Student Marketplace Backend API

CampusKart is a RESTful backend API designed for college and school students to buy and sell used books, study materials, and academic hardware.

The platform supports secure authentication, role-based access control, product listings, order management, and asynchronous background processing using Celery.

🚀 Tech Stack

FastAPI – Web framework

PostgreSQL – Relational database

SQLAlchemy – ORM

JWT – Authentication

bcrypt – Password hashing

Celery + Redis – Background task processing

Docker & Docker Compose – Containerization

🔐 Features
Authentication

User registration (Student/Admin)

Secure password hashing using bcrypt

JWT-based login authentication

Protected routes using access tokens

Role-Based Access Control

Students can create listings and place orders

Admin can manage users and remove listings

Listings

Create, update, delete listings

Category-based filtering

View all available study materials

Orders

Place purchase requests

Track order status (Pending / Confirmed / Completed)

View personal order history

Background Tasks (Celery)

Send order confirmation notifications

Notify seller when item is purchased

Clean expired listings (scheduled task)

📂 Project Structure
app/
 ├── main.py
 ├── database.py
 ├── models.py
 ├── schemas.py
 ├── auth.py
 ├── dependencies.py
 ├── tasks.py
 ├── routers/
 │    ├── users.py
 │    ├── listings.py
 │    └── orders.py
 ├── config.py
 └── utils.py

🐳 Running with Docker
1️⃣ Clone the repository
git clone https://github.com/yourusername/campuskart.git
cd campuskart

2️⃣ Create .env file
DATABASE_URL=postgresql://user:password@db:5432/campuskart
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

3️⃣ Run Docker Compose
docker-compose up --build


API will run at:

http://localhost:8000


Swagger Docs:

http://localhost:8000/docs
