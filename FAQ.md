# Frequently Asked Questions (FAQ)

## General Questions

### Q1: What is CampusKart?
**A:** CampusKart is a production-ready RESTful backend API for a student marketplace that enables buying and selling of used books and academic hardware. It's built with FastAPI, PostgreSQL, Celery, and Redis.

### Q2: Is this production-ready?
**A:** Yes! This project follows production best practices including:
- Docker containerization
- Environment-based configuration
- Security measures (JWT, bcrypt, RBAC)
- Background task processing
- Proper error handling
- Comprehensive documentation
- Deployment guides for multiple platforms

### Q3: Can I use this for my portfolio?
**A:** Absolutely! This project demonstrates:
- Backend development skills
- API design
- Database modeling
- Authentication & authorization
- Async task processing
- Docker & deployment knowledge

---

## Technical Questions

### Q4: Why FastAPI over Flask or Django?
**A:** FastAPI offers:
- Better performance (ASGI-based)
- Automatic API documentation
- Built-in data validation (Pydantic)
- Type hints and modern Python features
- Async support out of the box

### Q5: Why PostgreSQL instead of MySQL?
**A:** PostgreSQL provides:
- Better JSON support
- Advanced features (arrays, JSONB)
- Strong ACID compliance
- Better for complex queries
- Industry standard for modern apps

### Q6: Why Celery for background tasks?
**A:** Celery is:
- Industry standard for Python async tasks
- Reliable with retry mechanisms
- Scalable (horizontal worker scaling)
- Well-documented and mature
- Supports multiple brokers (Redis, RabbitMQ)

### Q7: Why JWT instead of session-based auth?
**A:** JWT tokens are:
- Stateless (no server-side storage)
- Scalable across multiple servers
- Mobile-friendly
- Microservices-ready
- Self-contained with user info

---

## Setup Questions

### Q8: Do I need to install Python if using Docker?
**A:** No! Docker containers include everything needed. You only need Docker Desktop installed.

### Q9: Can I run this on Windows?
**A:** Yes! The project works on:
- Windows (with Docker Desktop)
- macOS (with Docker Desktop)
- Linux (with Docker Engine)

### Q10: How long does initial setup take?
**A:** 
- With Docker: 5-10 minutes (first build)
- Without Docker: 15-20 minutes (manual setup)

### Q11: What if port 8000 is already in use?
**A:** Edit `docker-compose.yml`:
```yaml
backend:
  ports:
    - "8001:8000"  # Change 8000 to 8001
```

---

## Development Questions

### Q12: How do I add a new API endpoint?
**A:**
1. Add route function in appropriate router file
2. Define Pydantic schemas if needed
3. Implement business logic
4. Test with Swagger docs

Example:
```python
@router.get("/listings/search")
def search_listings(query: str, db: Session = Depends(get_db)):
    return db.query(Listing).filter(Listing.title.contains(query)).all()
```

### Q13: How do I add a new database field?
**A:**
1. Update model in `app/models.py`
2. Update schema in `app/schemas.py`
3. Create migration: `alembic revision --autogenerate -m "add field"`
4. Apply migration: `alembic upgrade head`

### Q14: How do I add a new background task?
**A:** Add to `app/tasks.py`:
```python
@celery_app.task(name="my_task")
def my_task(param):
    # Task logic here
    return {"status": "success"}
```

Call it:
```python
from app.tasks import my_task
my_task.delay(param)
```

### Q15: How do I add a new role?
**A:**
1. Update `RoleEnum` in `app/models.py`
2. Create dependency in `app/dependencies.py`
3. Use in route decorators

---

## Database Questions

### Q16: How do I reset the database?
**A:**
```bash
# Docker
docker-compose down -v
docker-compose up --build

# Local
alembic downgrade base
alembic upgrade head
```

### Q17: How do I view database contents?
**A:**
```bash
# Docker
docker-compose exec postgres psql -U campuskart -d campuskart_db

# Then run SQL
SELECT * FROM users;
```

### Q18: How do I backup the database?
**A:**
```bash
docker-compose exec postgres pg_dump -U campuskart campuskart_db > backup.sql
```

### Q19: Can I use MySQL instead of PostgreSQL?
**A:** Yes, but you'll need to:
1. Change DATABASE_URL in `.env`
2. Update `requirements.txt` (use `mysqlclient` instead of `psycopg2-binary`)
3. Adjust any PostgreSQL-specific features

---

## Security Questions

### Q20: Is the default SECRET_KEY secure?
**A:** No! Change it in production:
```python
import secrets
print(secrets.token_urlsafe(32))
```

### Q21: How do I enable HTTPS?
**A:** Use a reverse proxy (Nginx) or deploy to platforms that provide SSL (Render, Railway, AWS with ALB).

### Q22: Are passwords stored securely?
**A:** Yes! Passwords are hashed using bcrypt with a cost factor of 12 before storage.

### Q23: How do I prevent brute force attacks?
**A:** Implement rate limiting:
```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/auth/login")
@limiter.limit("5/minute")
def login(...):
    ...
```

### Q24: Is SQL injection possible?
**A:** No! SQLAlchemy ORM prevents SQL injection by using parameterized queries.

---

## Deployment Questions

### Q25: Where can I deploy this?
**A:** Multiple options:
- **Render.com** (easiest, $20-30/month)
- **Railway.app** (simple, pay-as-you-go)
- **AWS ECS** (scalable, $50-100/month)
- **DigitalOcean** (flexible, $25-50/month)
- **Heroku** (simple, $25-50/month)

### Q26: Do I need separate services for production?
**A:** Yes, you need:
- Backend API service
- PostgreSQL database
- Redis instance
- Celery worker service

### Q27: How much does it cost to run in production?
**A:**
- **Render**: ~$24/month (starter tier)
- **Railway**: ~$10-20/month (usage-based)
- **AWS**: ~$50-100/month (with RDS + ECS)

### Q28: How do I monitor the application?
**A:** Use:
- Application logs (built-in)
- Sentry (error tracking)
- New Relic (APM)
- CloudWatch (AWS)
- Datadog (comprehensive)

---

## Testing Questions

### Q29: How do I test the API?
**A:** Multiple ways:
1. Swagger UI: http://localhost:8000/docs
2. Test script: `python test_api.py`
3. Postman/Insomnia
4. curl commands (see API_EXAMPLES.md)

### Q30: How do I write unit tests?
**A:** Create `tests/` directory:
```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
```

Run: `pytest tests/`

### Q31: How do I test background tasks?
**A:** Use Celery's eager mode:
```python
celery_app.conf.task_always_eager = True
```

---

## Performance Questions

### Q32: How many requests can it handle?
**A:** Depends on resources, but typically:
- Single instance: 100-500 req/sec
- With load balancer: 1000+ req/sec
- Optimized: 5000+ req/sec

### Q33: How do I improve performance?
**A:**
1. Add database indexes
2. Implement caching (Redis)
3. Use connection pooling
4. Horizontal scaling (more instances)
5. CDN for static assets
6. Database query optimization

### Q34: Should I use async endpoints?
**A:** For I/O-bound operations (external APIs, file operations), yes:
```python
@router.get("/async-endpoint")
async def async_endpoint():
    result = await some_async_operation()
    return result
```

---

## Troubleshooting Questions

### Q35: Why is Docker build slow?
**A:** First build downloads images and installs dependencies. Subsequent builds use cache and are faster.

### Q36: Why can't I connect to the database?
**A:** Check:
1. PostgreSQL service is running: `docker-compose ps`
2. DATABASE_URL is correct in `.env`
3. Network connectivity
4. Firewall settings

### Q37: Why are background tasks not running?
**A:** Check:
1. Celery worker is running: `docker-compose ps celery_worker`
2. Redis is accessible: `docker-compose logs redis`
3. Task is properly defined in `tasks.py`
4. Task is called with `.delay()` or `.apply_async()`

### Q38: Why do I get 401 Unauthorized?
**A:** Check:
1. Token is included in Authorization header
2. Token format: `Bearer <token>`
3. Token hasn't expired (30 min default)
4. User exists in database

---

## Extension Questions

### Q39: How do I add image uploads?
**A:**
1. Install: `pip install python-multipart`
2. Add endpoint:
```python
@router.post("/listings/{id}/image")
async def upload_image(id: int, file: UploadFile = File(...)):
    # Save to S3 or local storage
    pass
```

### Q40: How do I add search functionality?
**A:** Options:
1. Simple: PostgreSQL LIKE queries
2. Advanced: Elasticsearch integration
3. Full-text: PostgreSQL full-text search

### Q41: How do I add email notifications?
**A:**
1. Install: `pip install fastapi-mail`
2. Configure SMTP settings
3. Send emails in Celery tasks

### Q42: How do I add pagination?
**A:** Already implemented! Use query parameters:
```
GET /listings?skip=0&limit=10
```

### Q43: How do I add filtering?
**A:** Add query parameters:
```python
@router.get("/listings")
def get_listings(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Listing)
    if category:
        query = query.filter(Listing.category == category)
    if min_price:
        query = query.filter(Listing.price >= min_price)
    return query.all()
```

---

## Best Practices Questions

### Q44: Should I commit .env file?
**A:** No! Never commit `.env` files. Use `.env.example` as a template.

### Q45: How often should I update dependencies?
**A:** 
- Security updates: Immediately
- Minor updates: Monthly
- Major updates: Quarterly (with testing)

### Q46: Should I use type hints?
**A:** Yes! Type hints improve:
- Code readability
- IDE autocomplete
- Error detection
- Documentation

### Q47: How should I structure large projects?
**A:** Current structure is good for medium projects. For larger:
```
app/
├── api/
│   └── v1/
│       ├── endpoints/
│       └── dependencies/
├── core/
│   ├── config.py
│   └── security.py
├── models/
├── schemas/
└── services/
```

---

## Interview Questions

### Q48: What would you ask about this project in an interview?
**A:** Common questions:
- Explain the authentication flow
- How does JWT work?
- Why use Celery?
- How would you scale this?
- Security considerations?
- Database design decisions?
- How to handle race conditions?
- Caching strategy?

### Q49: What improvements would you make?
**A:** Potential improvements:
- Add caching layer
- Implement rate limiting
- Add comprehensive tests
- Implement search with Elasticsearch
- Add API versioning
- Implement WebSockets for real-time
- Add monitoring and alerting
- Implement CI/CD pipeline

### Q50: How is this different from a tutorial project?
**A:** This project includes:
- Production-ready configuration
- Proper error handling
- Security best practices
- Background task processing
- Docker containerization
- Deployment guides
- Comprehensive documentation
- Scalability considerations
- Clean architecture
- RBAC implementation

---

## Need More Help?

- 📖 Check documentation files
- 🔍 Review code comments
- 🌐 Visit FastAPI docs: https://fastapi.tiangolo.com
- 💬 Check Stack Overflow
- 📧 Review error messages carefully
