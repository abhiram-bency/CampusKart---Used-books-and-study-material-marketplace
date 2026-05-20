# Complete Setup Instructions

## Prerequisites

### Required Software
- **Docker Desktop** (Windows/Mac) or Docker Engine (Linux)
- **Docker Compose** (usually included with Docker Desktop)
- **Git** (optional, for version control)
- **Python 3.11+** (only for local development without Docker)

### Installation Links
- Docker Desktop: https://www.docker.com/products/docker-desktop
- Python: https://www.python.org/downloads/
- Git: https://git-scm.com/downloads

## Setup Methods

### Method 1: Docker (Recommended - Easiest)

#### Step 1: Navigate to Project
```bash
cd d:\PRG\campuskart
```

#### Step 2: Start Services
```bash
docker-compose up --build
```

Wait for all services to start (first time takes 2-5 minutes).

#### Step 3: Verify
Open browser: http://localhost:8000/docs

You should see the Swagger API documentation.

#### Step 4: Test API
```bash
python test_api.py
```

**That's it! You're ready to use the API.**

---

### Method 2: Local Development (Without Docker)

#### Step 1: Install PostgreSQL
Download and install PostgreSQL 15:
https://www.postgresql.org/download/

Create database:
```sql
CREATE DATABASE campuskart_db;
CREATE USER campuskart WITH PASSWORD 'campuskart123';
GRANT ALL PRIVILEGES ON DATABASE campuskart_db TO campuskart;
```

#### Step 2: Install Redis
**Windows**: Download from https://github.com/microsoftarchive/redis/releases
**Mac**: `brew install redis`
**Linux**: `sudo apt-get install redis-server`

Start Redis:
```bash
redis-server
```

#### Step 3: Create Virtual Environment
```bash
cd d:\PRG\campuskart
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
```

#### Step 4: Install Dependencies
```bash
pip install -r requirements.txt
```

#### Step 5: Configure Environment
Edit `.env` file:
```env
DATABASE_URL=postgresql://campuskart:campuskart123@localhost:5432/campuskart_db
SECRET_KEY=your-secret-key-change-in-production-min-32-chars-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://localhost:6379/0
```

#### Step 6: Run Migrations
```bash
alembic upgrade head
```

#### Step 7: Start FastAPI Server
```bash
uvicorn app.main:app --reload
```

#### Step 8: Start Celery Worker (New Terminal)
```bash
cd d:\PRG\campuskart
venv\Scripts\activate
celery -A app.tasks.celery_app worker --loglevel=info
```

#### Step 9: Test
Open browser: http://localhost:8000/docs

---

## Verification Steps

### 1. Check Services Status

**Docker Method:**
```bash
docker-compose ps
```

Expected output:
```
NAME                    STATUS
campuskart_backend      Up
campuskart_postgres     Up (healthy)
campuskart_redis        Up (healthy)
campuskart_celery       Up
```

**Local Method:**
- PostgreSQL: Check if running on port 5432
- Redis: Check if running on port 6379
- FastAPI: Check if running on port 8000
- Celery: Check worker logs

### 2. Test Health Endpoint
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "campuskart-api"
}
```

### 3. Test API Documentation
Open: http://localhost:8000/docs

You should see interactive Swagger UI.

### 4. Run Test Script
```bash
python test_api.py
```

Expected: All tests pass successfully.

---

## Common Issues & Solutions

### Issue 1: Port Already in Use

**Error**: "Port 8000 is already allocated"

**Solution**:
```bash
# Stop existing services
docker-compose down

# Or change port in docker-compose.yml
ports:
  - "8001:8000"  # Use 8001 instead
```

### Issue 2: Database Connection Failed

**Error**: "could not connect to server"

**Solution**:
```bash
# Check if postgres is running
docker-compose ps postgres

# Restart postgres
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Issue 3: Celery Worker Not Starting

**Error**: "Cannot connect to redis"

**Solution**:
```bash
# Check Redis status
docker-compose ps redis

# Restart Redis
docker-compose restart redis

# Check Redis logs
docker-compose logs redis
```

### Issue 4: Permission Denied (Windows)

**Error**: "Permission denied" when running Docker

**Solution**:
- Run Docker Desktop as Administrator
- Ensure WSL2 is installed and updated
- Check Docker Desktop settings

### Issue 5: Module Not Found

**Error**: "ModuleNotFoundError: No module named 'app'"

**Solution**:
```bash
# Ensure you're in the correct directory
cd d:\PRG\campuskart

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue 6: Alembic Migration Failed

**Error**: "Target database is not up to date"

**Solution**:
```bash
# Check current revision
alembic current

# Upgrade to latest
alembic upgrade head

# If issues persist, reset
alembic downgrade base
alembic upgrade head
```

---

## Environment Variables Explained

```env
# Database connection string
DATABASE_URL=postgresql://user:password@host:port/database

# JWT secret key (MUST be changed in production)
SECRET_KEY=minimum-32-characters-long-random-string

# JWT algorithm
ALGORITHM=HS256

# Token expiration in minutes
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis connection string
REDIS_URL=redis://host:port/db
```

### Generate Secure Secret Key
```python
import secrets
print(secrets.token_urlsafe(32))
```

---

## Development Workflow

### 1. Make Code Changes
Edit files in `app/` directory

### 2. Test Locally
```bash
# API auto-reloads with --reload flag
uvicorn app.main:app --reload
```

### 3. Create Database Migration
```bash
alembic revision --autogenerate -m "description of changes"
alembic upgrade head
```

### 4. Test Changes
```bash
python test_api.py
```

### 5. Commit Changes
```bash
git add .
git commit -m "Description of changes"
git push
```

---

## Stopping Services

### Docker Method
```bash
# Stop services (keeps data)
docker-compose stop

# Stop and remove containers (keeps data)
docker-compose down

# Stop and remove everything including volumes (deletes data)
docker-compose down -v
```

### Local Method
```bash
# Stop FastAPI: Ctrl+C in terminal
# Stop Celery: Ctrl+C in terminal
# Stop Redis: redis-cli shutdown
# Stop PostgreSQL: pg_ctl stop
```

---

## Viewing Logs

### Docker Method
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f celery_worker
docker-compose logs -f postgres
docker-compose logs -f redis

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Local Method
- FastAPI: Check terminal output
- Celery: Check worker terminal
- PostgreSQL: Check PostgreSQL logs directory
- Redis: Check redis-server output

---

## Database Management

### Access PostgreSQL

**Docker:**
```bash
docker-compose exec postgres psql -U campuskart -d campuskart_db
```

**Local:**
```bash
psql -U campuskart -d campuskart_db
```

### Useful SQL Commands
```sql
-- List tables
\dt

-- Describe table
\d users

-- Query data
SELECT * FROM users;
SELECT * FROM listings;
SELECT * FROM orders;

-- Exit
\q
```

### Backup Database
```bash
# Docker
docker-compose exec postgres pg_dump -U campuskart campuskart_db > backup.sql

# Local
pg_dump -U campuskart campuskart_db > backup.sql
```

### Restore Database
```bash
# Docker
docker-compose exec -T postgres psql -U campuskart campuskart_db < backup.sql

# Local
psql -U campuskart campuskart_db < backup.sql
```

---

## Redis Management

### Access Redis CLI

**Docker:**
```bash
docker-compose exec redis redis-cli
```

**Local:**
```bash
redis-cli
```

### Useful Redis Commands
```bash
# Check connection
PING

# List all keys
KEYS *

# Get value
GET key_name

# Clear all data
FLUSHALL

# Exit
EXIT
```

---

## Performance Tuning

### Increase Workers
Edit `docker-compose.yml`:
```yaml
backend:
  command: gunicorn app.main:app --workers 8 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Database Connection Pool
Edit `app/database.py`:
```python
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=40
)
```

### Celery Concurrency
```bash
celery -A app.tasks.celery_app worker --concurrency=4 --loglevel=info
```

---

## Next Steps

1. ✅ Setup complete
2. 📖 Read API_EXAMPLES.md for API usage
3. 🏗️ Read ARCHITECTURE.md to understand design
4. 🚀 Read DEPLOYMENT.md for production deployment
5. 🧪 Modify and extend the API
6. 📊 Add monitoring and logging
7. 🔒 Implement additional security features
8. 📱 Build a frontend application

---

## Getting Help

### Documentation
- README.md - Project overview
- ARCHITECTURE.md - System design
- API_EXAMPLES.md - API usage
- DEPLOYMENT.md - Production deployment
- DIAGRAMS.md - Visual diagrams

### Resources
- FastAPI Docs: https://fastapi.tiangolo.com
- SQLAlchemy Docs: https://docs.sqlalchemy.org
- Celery Docs: https://docs.celeryproject.org
- Docker Docs: https://docs.docker.com

### Troubleshooting
1. Check logs: `docker-compose logs -f`
2. Verify services: `docker-compose ps`
3. Test health: `curl http://localhost:8000/health`
4. Review error messages carefully
5. Check environment variables in `.env`

---

## Success Checklist

- [ ] Docker services running
- [ ] Health endpoint returns 200
- [ ] Swagger docs accessible
- [ ] Can register user
- [ ] Can login and get token
- [ ] Can create listing
- [ ] Can create order
- [ ] Celery worker processing tasks
- [ ] Test script passes

**If all checked, you're ready to develop!** 🎉
