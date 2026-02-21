---

# CampusKart – Student Marketplace Backend API

A production-ready RESTful backend API for a student-focused marketplace that enables buying and selling of used books and academic hardware.

Built with modern backend technologies including FastAPI, PostgreSQL, JWT authentication, Celery background tasks, Redis, and Docker.

---

 Tech Stack:

* Python 3.11+
* FastAPI
* PostgreSQL
* SQLAlchemy
* Alembic**
* JWT (python-jose)
* bcrypt (passlib)
* Celery
* Redis
* Docker & Docker Compose
* python-dotenv

---

 Features:

*  JWT-based Authentication
*  bcrypt Password Hashing
*  Role-Based Access Control (Student/Admin)
*  Product Listing Management
*  Order Management System
*  Asynchronous Order Processing (Celery + Redis)
*  Fully Dockerized Multi-Service Architecture
*  Deployment Ready (Render / Railway / AWS)
*  Auto-generated Swagger API Documentation

---

 System Architecture : 

```
Client (Postman / Frontend)
        ↓
FastAPI Backend
        ↓
PostgreSQL Database
        ↓
Redis (Broker)
        ↓
Celery Worker (Background Tasks)
```

---

 Project Structure : 

```
campuskart/
│
├── app/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── dependencies.py
│   ├── routers/
│   │     ├── users.py
│   │     ├── listings.py
│   │     └── orders.py
│   ├── tasks.py
│   └── celery_worker.py
│
├── alembic/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
└── README.md
```

---

  Database Schema :

### User

* id (PK)
* name
* email (unique)
* hashed_password
* role (student/admin)
* created_at

### Listing

* id (PK)
* title
* description
* price
* category (book/hardware)
* owner_id (FK → User)
* created_at

### Order

* id (PK)
* buyer_id (FK → User)
* listing_id (FK → Listing)
* status (pending/completed/cancelled)
* created_at

---

##  Authentication & Authorization

* JWT Access Tokens
* Password hashing using bcrypt
* Token expiration support
* `get_current_user` dependency
* Role-based endpoint protection
* Admin-only routes
* Owner-only modification access

---

##  API Endpoints

###  Authentication

* `POST /register`
* `POST /login`

---

###  Listings

* `POST /listings`
* `GET /listings`
* `GET /listings/{id}`
* `PUT /listings/{id}`
* `DELETE /listings/{id}`

Rules:

* Only authenticated users can create listings
* Only owner or admin can modify/delete
* Pagination supported

---

###  Orders

* `POST /orders`
* `GET /orders/me`
* `GET /orders` (Admin only)

Rules:

* Users cannot purchase their own listings
* Background task triggered after order creation
* Proper relational linking

---

##  Background Tasks (Celery + Redis)

* Order notification simulation
* Asynchronous order processing
* Redis used as message broker
* Separate Celery worker service

Run worker:

```
celery -A app.tasks worker --loglevel=info
```

---

##  Docker Setup (Recommended Way)

###  Step 1 – Clone Repository

```
git clone <your-repo-url>
cd campuskart
```

###  Step 2 – Configure Environment Variables

Create `.env` file:

```
DATABASE_URL=postgresql://postgres:password@db:5432/campuskart
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://redis:6379/0
```

---

###  Step 3 – Build & Run

```
docker-compose up --build
```

Services started:

* FastAPI backend
* PostgreSQL
* Redis
* Celery worker

---

##  API Documentation

After running:

```
http://localhost:8000/docs
```

Interactive Swagger UI available.

---

##  Running Locally (Without Docker)

### Create virtual environment

```
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### Install dependencies

```
pip install -r requirements.txt
```

### Run server

```
uvicorn app.main:app --reload
```

---

##  Deployment

Deployment-ready for:

* Render
* Railway
* AWS ECS
* Docker-based cloud platforms

Production Recommendations:

* Use Gunicorn with Uvicorn workers
* Secure environment variables
* Enable HTTPS
* Configure CORS properly

---

##  Learning Outcomes

This project demonstrates:

* Clean REST API design
* Database modeling with relationships
* Secure authentication implementation
* Role-based authorization
* Asynchronous task processing
* Docker-based microservice architecture
* Production-level backend structure

---

##  Why This Project Matters

CampusKart reflects real-world backend architecture used in production systems:

* Modular code structure
* Secure authentication
* Scalable background job processing
* Containerized deployment


##  Future Improvements

* Payment Integration (Stripe)
* Email Service Integration (SendGrid)
* Caching with Redis
* Rate Limiting
* CI/CD Pipeline
* Unit & Integration Testing
* API Versioning

---

##  Author

Abhiram Bency
B.Tech Computer Science
Backend & AI Enthusiast

---
