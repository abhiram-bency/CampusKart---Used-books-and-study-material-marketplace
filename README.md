# CampusKart – Student Marketplace Backend API

A production-ready, scalable RESTful backend API for a student-focused marketplace enabling buying and selling of used books and academic hardware.

## 🚀 Tech Stack

- **Python 3.11+**
- **FastAPI** - Modern web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **JWT Authentication** - python-jose
- **bcrypt** - Password hashing (passlib)
- **Celery** - Background task processing
- **Redis** - Message broker
- **Docker & Docker Compose** - Containerization

## 📁 Project Structure

```
campuskart/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # JWT authentication utilities
│   ├── dependencies.py      # Dependency injection
│   ├── tasks.py             # Celery tasks
│   ├── celery_worker.py     # Celery worker entry point
│   └── routers/
│       ├── users.py         # Authentication endpoints
│       ├── listings.py      # Listing CRUD endpoints
│       └── orders.py        # Order management endpoints
├── alembic/                 # Database migrations
├── Dockerfile               # Container configuration
├── docker-compose.yml       # Multi-container orchestration
├── requirements.txt         # Python dependencies
├── .env.example             # Environment variables template
└── README.md
```

## 🔑 Key Features

### Authentication & Authorization
- JWT-based authentication with access tokens
- bcrypt password hashing
- Role-Based Access Control (Student/Admin)
- Protected endpoints with dependency injection

### Database Schema
- **Users**: id, name, email, hashed_password, role, created_at
- **Listings**: id, title, description, price, category, owner_id, created_at
- **Orders**: id, buyer_id, listing_id, status, created_at
- Proper foreign key relationships and cascading deletes

### API Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

#### Listings
- `POST /listings` - Create listing (authenticated)
- `GET /listings` - Get all listings (paginated)
- `GET /listings/{id}` - Get single listing
- `PUT /listings/{id}` - Update listing (owner/admin only)
- `DELETE /listings/{id}` - Delete listing (owner/admin only)

#### Orders
- `POST /orders` - Create order (authenticated)
- `GET /orders/me` - Get user's orders
- `GET /orders` - Get all orders (admin only)

### Background Tasks
- Celery worker for async processing
- Order notification system
- Redis as message broker

## 🛠️ Setup Instructions

### Prerequisites
- Docker & Docker Compose installed
- Git

### Quick Start with Docker (Recommended)

1. **Clone the repository**
```bash
cd d:\PRG
cd campuskart
```

2. **Create environment file**
```bash
copy .env.example .env
```

3. **Build and run with Docker Compose**
```bash
docker-compose up --build
```

The API will be available at `http://localhost:8000`

4. **Access API Documentation**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Local Development Setup (Without Docker)

1. **Create virtual environment**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Setup PostgreSQL and Redis locally**

4. **Configure environment variables**
```bash
copy .env.example .env
# Edit .env with your local database credentials
```

5. **Run database migrations**
```bash
alembic upgrade head
```

6. **Start the application**
```bash
uvicorn app.main:app --reload
```

7. **Start Celery worker (separate terminal)**
```bash
celery -A app.tasks.celery_app worker --loglevel=info
```

## 🧪 API Testing Examples

### 1. Register a User
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### 2. Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=john@example.com&password=password123"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. Create a Listing
```bash
curl -X POST "http://localhost:8000/listings" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Data Structures Textbook",
    "description": "Excellent condition, barely used",
    "price": 45.99,
    "category": "book"
  }'
```

### 4. Get All Listings
```bash
curl -X GET "http://localhost:8000/listings?skip=0&limit=10"
```

### 5. Create an Order
```bash
curl -X POST "http://localhost:8000/orders" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "listing_id": 1
  }'
```

### 6. Get My Orders
```bash
curl -X GET "http://localhost:8000/orders/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🚢 Deployment

### Deploy to Render

1. **Create a new Web Service**
   - Connect your GitHub repository
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`

2. **Add PostgreSQL Database**
   - Create a PostgreSQL instance on Render
   - Copy the Internal Database URL

3. **Add Redis Instance**
   - Create a Redis instance on Render
   - Copy the Internal Redis URL

4. **Configure Environment Variables**
   - Add all variables from `.env.example`
   - Use internal URLs for DATABASE_URL and REDIS_URL

5. **Deploy Celery Worker**
   - Create a Background Worker service
   - Start Command: `celery -A app.tasks.celery_app worker --loglevel=info`

### Deploy to Railway

1. **Create new project**
```bash
railway init
```

2. **Add PostgreSQL and Redis**
```bash
railway add postgresql
railway add redis
```

3. **Deploy**
```bash
railway up
```

4. **Set environment variables** in Railway dashboard

### Deploy to AWS ECS (Advanced)

1. Push Docker image to ECR
2. Create ECS Task Definition
3. Configure RDS PostgreSQL and ElastiCache Redis
4. Create ECS Service with Load Balancer
5. Configure environment variables in Task Definition

## 🔒 Security Best Practices

- JWT tokens with expiration
- Password hashing with bcrypt
- Environment-based configuration
- CORS configuration
- SQL injection prevention via ORM
- Input validation with Pydantic

## 📊 Database Migrations

### Create a new migration
```bash
alembic revision --autogenerate -m "description"
```

### Apply migrations
```bash
alembic upgrade head
```

### Rollback migration
```bash
alembic downgrade -1
```

## 🧹 Production Considerations

- Use strong SECRET_KEY (min 32 characters)
- Configure CORS for specific origins
- Enable HTTPS in production
- Set up monitoring and logging
- Use connection pooling
- Implement rate limiting
- Add request validation
- Set up backup strategy for PostgreSQL

## 📝 License

MIT License

## 👨‍💻 Author

Built for backend internship preparation - Production-ready architecture following industry best practices.
