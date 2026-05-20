# CampusKart Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Start Services
```bash
docker-compose up --build
```

### Step 2: Access API
- Swagger Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### Step 3: Test API
```bash
python test_api.py
```

## 📋 Common Commands

### Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild
docker-compose up --build

# Remove volumes
docker-compose down -v
```

### Database Migrations
```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run API
uvicorn app.main:app --reload

# Run Celery worker
celery -A app.tasks.celery_app worker --loglevel=info
```

## 🔑 Quick API Test

### 1. Register
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123"}'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -d "username=test@test.com&password=pass123"
```

### 3. Create Listing
```bash
curl -X POST http://localhost:8000/listings \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Book","price":50,"category":"book"}'
```

## 📁 Key Files

- `app/main.py` - FastAPI app
- `app/models.py` - Database models
- `app/schemas.py` - Pydantic schemas
- `app/routers/` - API endpoints
- `docker-compose.yml` - Services config
- `.env` - Environment variables

## 🐛 Troubleshooting

**Port already in use**
```bash
docker-compose down
# Change port in docker-compose.yml
```

**Database connection failed**
```bash
# Check DATABASE_URL in .env
# Ensure postgres service is running
docker-compose ps
```

**Celery not working**
```bash
# Check Redis connection
docker-compose logs redis
docker-compose logs celery_worker
```

## 📚 Documentation

- README.md - Full documentation
- ARCHITECTURE.md - Design decisions
- DEPLOYMENT.md - Production deployment
- API_EXAMPLES.md - API usage examples
