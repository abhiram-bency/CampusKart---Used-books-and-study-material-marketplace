# CampusKart Architecture Documentation

## System Architecture Overview

CampusKart follows a **clean architecture** pattern with clear separation of concerns, making it maintainable, testable, and scalable.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│              (Web/Mobile Apps, API Consumers)                │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Application                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routers    │  │ Dependencies │  │    Auth      │      │
│  │  (Endpoints) │  │  (Injection) │  │    (JWT)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Schemas    │  │    Models    │  │   Database   │      │
│  │  (Pydantic)  │  │ (SQLAlchemy) │  │   (Config)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                ↓                              ↓
┌─────────────────────────┐    ┌─────────────────────────────┐
│   PostgreSQL Database   │    │    Celery + Redis           │
│   (Persistent Storage)  │    │  (Background Tasks)         │
└─────────────────────────┘    └─────────────────────────────┘
```

## Key Architectural Decisions

### 1. Clean Architecture & Separation of Concerns

**Decision**: Modular structure with distinct layers
- **Routers**: Handle HTTP requests/responses
- **Schemas**: Validate input/output (Pydantic)
- **Models**: Define database structure (SQLAlchemy)
- **Dependencies**: Reusable injection functions
- **Auth**: Centralized authentication logic

**Rationale**:
- Easy to test individual components
- Changes in one layer don't affect others
- Clear responsibility boundaries
- Easier onboarding for new developers

### 2. FastAPI Framework

**Decision**: Use FastAPI over Flask/Django

**Rationale**:
- **Performance**: ASGI-based, async support
- **Type Safety**: Built-in Pydantic validation
- **Auto Documentation**: Swagger/OpenAPI out-of-the-box
- **Modern**: Python 3.11+ features
- **Developer Experience**: Fast development, fewer bugs

### 3. SQLAlchemy ORM

**Decision**: Use ORM instead of raw SQL

**Rationale**:
- **Security**: Protection against SQL injection
- **Productivity**: Less boilerplate code
- **Database Agnostic**: Easy to switch databases
- **Relationships**: Clean handling of foreign keys
- **Migrations**: Seamless with Alembic

### 4. JWT Authentication

**Decision**: Stateless JWT tokens vs session-based auth

**Rationale**:
- **Scalability**: No server-side session storage
- **Microservices Ready**: Easy to share across services
- **Mobile Friendly**: Works well with mobile apps
- **Stateless**: Each request is independent

**Security Measures**:
- bcrypt password hashing (cost factor 12)
- Token expiration (30 minutes default)
- Secure secret key management
- Bearer token scheme

### 5. Role-Based Access Control (RBAC)

**Decision**: Simple role system (student/admin)

**Implementation**:
```python
# Dependency injection for authorization
def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.admin:
        raise HTTPException(403, "Admin access required")
    return current_user
```

**Rationale**:
- **Simplicity**: Two roles sufficient for MVP
- **Extensibility**: Easy to add more roles later
- **Reusability**: Dependency injection pattern
- **Security**: Centralized authorization logic

### 6. Celery + Redis for Background Tasks

**Decision**: Async task processing with Celery

**Use Cases**:
- Order notification emails
- Report generation
- Data processing
- Scheduled tasks

**Rationale**:
- **Performance**: Don't block API responses
- **Reliability**: Task retry mechanisms
- **Scalability**: Horizontal worker scaling
- **Monitoring**: Built-in task tracking

### 7. Docker & Docker Compose

**Decision**: Full containerization

**Services**:
- `backend`: FastAPI application
- `postgres`: Database
- `redis`: Message broker
- `celery_worker`: Background tasks

**Rationale**:
- **Consistency**: Same environment everywhere
- **Isolation**: No dependency conflicts
- **Portability**: Deploy anywhere
- **Development**: Easy local setup

### 8. Database Schema Design

#### User Model
```python
User
├── id (PK)
├── name
├── email (unique, indexed)
├── hashed_password
├── role (enum: student/admin)
└── created_at
```

#### Listing Model
```python
Listing
├── id (PK)
├── title
├── description
├── price
├── category (enum: book/hardware)
├── owner_id (FK → User)
└── created_at
```

#### Order Model
```python
Order
├── id (PK)
├── buyer_id (FK → User)
├── listing_id (FK → Listing)
├── status (enum: pending/completed/cancelled)
└── created_at
```

**Relationships**:
- User → Listings (One-to-Many)
- User → Orders (One-to-Many)
- Listing → Orders (One-to-Many)

**Design Decisions**:
- **Enums**: Type safety for categories and statuses
- **Timestamps**: Track creation for auditing
- **Cascade Deletes**: Clean up related records
- **Indexes**: Fast lookups on email and foreign keys

### 9. Pydantic Schemas

**Decision**: Separate schemas for create/update/response

**Pattern**:
```python
ListingBase      # Common fields
ListingCreate    # For POST requests
ListingUpdate    # For PUT requests (optional fields)
ListingResponse  # For API responses
```

**Rationale**:
- **Validation**: Automatic input validation
- **Documentation**: Auto-generated API docs
- **Type Safety**: Catch errors at development time
- **Flexibility**: Different schemas for different operations

### 10. Dependency Injection

**Decision**: FastAPI's dependency system for reusable logic

**Examples**:
```python
# Database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Current user
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Verify token and return user
    pass

# Admin check
def require_admin(current_user: User = Depends(get_current_user)):
    # Check if user is admin
    pass
```

**Benefits**:
- **Reusability**: Write once, use everywhere
- **Testability**: Easy to mock dependencies
- **Readability**: Clear function signatures
- **Composition**: Chain dependencies

## API Design Principles

### RESTful Conventions
- `GET /listings` - List resources
- `POST /listings` - Create resource
- `GET /listings/{id}` - Get single resource
- `PUT /listings/{id}` - Update resource
- `DELETE /listings/{id}` - Delete resource

### HTTP Status Codes
- `200 OK` - Successful GET/PUT
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist

### Response Format
```json
{
  "id": 1,
  "title": "Data Structures Book",
  "price": 45.99,
  "created_at": "2024-01-15T10:30:00"
}
```

### Error Format
```json
{
  "detail": "Listing not found"
}
```

## Security Architecture

### Authentication Flow
```
1. User registers → Password hashed with bcrypt
2. User logs in → JWT token generated
3. User makes request → Token in Authorization header
4. Server validates token → Extract user info
5. Check permissions → Allow/deny access
```

### Security Layers
1. **Input Validation**: Pydantic schemas
2. **SQL Injection**: SQLAlchemy ORM
3. **Password Security**: bcrypt hashing
4. **Token Security**: JWT with expiration
5. **Authorization**: Role-based access control
6. **CORS**: Configurable origins

## Scalability Considerations

### Horizontal Scaling
- **Stateless API**: Multiple backend instances
- **Load Balancer**: Distribute traffic
- **Database Connection Pool**: Efficient connections
- **Celery Workers**: Scale independently

### Vertical Scaling
- **Gunicorn Workers**: Multiple processes
- **Uvicorn Workers**: Async handling
- **Database Resources**: Increase CPU/RAM

### Caching Strategy (Future)
- Redis for frequently accessed data
- Cache listings for 5 minutes
- Invalidate on updates

### Database Optimization
- Indexes on foreign keys
- Pagination for large result sets
- Query optimization with SQLAlchemy

## Testing Strategy

### Unit Tests
- Test individual functions
- Mock database and dependencies
- Test authentication logic

### Integration Tests
- Test API endpoints
- Use test database
- Test complete workflows

### Load Tests
- Simulate concurrent users
- Identify bottlenecks
- Measure response times

## Monitoring & Observability

### Logging
```python
import logging
logger = logging.getLogger(__name__)
logger.info("User created", extra={"user_id": user.id})
```

### Metrics to Track
- Request rate
- Response time
- Error rate
- Database query time
- Celery task duration

### Health Checks
- `/health` endpoint
- Database connectivity
- Redis connectivity
- Celery worker status

## Future Enhancements

### Phase 2
- [ ] Image upload for listings
- [ ] Search and filtering
- [ ] User ratings and reviews
- [ ] Payment integration
- [ ] Real-time chat

### Phase 3
- [ ] Recommendation engine
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Email notifications
- [ ] Admin panel

### Technical Improvements
- [ ] GraphQL API option
- [ ] WebSocket support
- [ ] Elasticsearch for search
- [ ] S3 for file storage
- [ ] CloudFront CDN

## Conclusion

This architecture provides:
- **Maintainability**: Clean code structure
- **Scalability**: Horizontal and vertical scaling
- **Security**: Multiple security layers
- **Performance**: Async processing, caching ready
- **Developer Experience**: Fast development, good DX
- **Production Ready**: Docker, monitoring, logging

The design follows industry best practices and is suitable for:
- Backend internship interviews
- Production deployment
- Team collaboration
- Future feature additions
