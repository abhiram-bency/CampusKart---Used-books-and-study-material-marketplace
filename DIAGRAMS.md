# CampusKart System Flow Diagrams

## Authentication Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. POST /auth/register
     │    {name, email, password}
     ▼
┌─────────────────┐
│   FastAPI       │
│   (users.py)    │
└────┬────────────┘
     │
     │ 2. Hash password (bcrypt)
     │ 3. Create user record
     ▼
┌─────────────────┐
│   PostgreSQL    │
│   (users table) │
└─────────────────┘

     │
     │ 4. POST /auth/login
     │    {email, password}
     ▼
┌─────────────────┐
│   FastAPI       │
│   (auth.py)     │
└────┬────────────┘
     │
     │ 5. Verify password
     │ 6. Generate JWT token
     ▼
┌─────────┐
│  User   │ ← Token: eyJhbGc...
└─────────┘
```

## Listing Creation Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. POST /listings
     │    Authorization: Bearer <token>
     │    {title, price, category}
     ▼
┌──────────────────────┐
│   FastAPI            │
│   (dependencies.py)  │
└────┬─────────────────┘
     │
     │ 2. Verify JWT token
     │ 3. Extract user from token
     ▼
┌──────────────────────┐
│   FastAPI            │
│   (listings.py)      │
└────┬─────────────────┘
     │
     │ 4. Validate input (Pydantic)
     │ 5. Create listing with owner_id
     ▼
┌──────────────────────┐
│   PostgreSQL         │
│   (listings table)   │
└────┬─────────────────┘
     │
     │ 6. Return created listing
     ▼
┌─────────┐
│  User   │ ← {id, title, price, ...}
└─────────┘
```

## Order Creation Flow with Background Task

```
┌─────────┐
│ Buyer   │
└────┬────┘
     │
     │ 1. POST /orders
     │    Authorization: Bearer <token>
     │    {listing_id: 2}
     ▼
┌──────────────────────┐
│   FastAPI            │
│   (orders.py)        │
└────┬─────────────────┘
     │
     │ 2. Verify user is authenticated
     │ 3. Check listing exists
     │ 4. Verify buyer != owner
     ▼
┌──────────────────────┐
│   PostgreSQL         │
│   (orders table)     │
└────┬─────────────────┘
     │
     │ 5. Create order record
     │ 6. Trigger background task
     ▼
┌──────────────────────┐
│   Celery + Redis     │
│   (tasks.py)         │
└────┬─────────────────┘
     │
     │ 7. Queue notification task
     │ 8. Process asynchronously
     ▼
┌──────────────────────┐
│   Email/Notification │
│   (simulated)        │
└──────────────────────┘

     │
     │ 9. Return order immediately
     ▼
┌─────────┐
│ Buyer   │ ← {id, status: "pending", ...}
└─────────┘
```

## Authorization Flow (Update Listing)

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. PUT /listings/1
     │    Authorization: Bearer <token>
     │    {price: 50}
     ▼
┌──────────────────────┐
│   get_current_user   │
│   (dependencies.py)  │
└────┬─────────────────┘
     │
     │ 2. Decode JWT token
     │ 3. Fetch user from DB
     ▼
┌──────────────────────┐
│   listings.py        │
│   update_listing()   │
└────┬─────────────────┘
     │
     │ 4. Fetch listing from DB
     │ 5. Check: owner_id == user.id OR user.role == admin
     │
     ├─── YES ──────────┐
     │                  │
     │                  ▼
     │            ┌──────────────┐
     │            │ Update DB    │
     │            │ Return 200   │
     │            └──────────────┘
     │
     └─── NO ───────────┐
                        │
                        ▼
                  ┌──────────────┐
                  │ Return 403   │
                  │ Forbidden    │
                  └──────────────┘
```

## Database Relationships

```
┌─────────────────┐
│     User        │
│─────────────────│
│ id (PK)         │
│ name            │
│ email           │
│ hashed_password │
│ role            │
│ created_at      │
└────┬────────────┘
     │
     │ One-to-Many
     │
     ├──────────────────────┐
     │                      │
     ▼                      ▼
┌─────────────────┐   ┌─────────────────┐
│    Listing      │   │     Order       │
│─────────────────│   │─────────────────│
│ id (PK)         │   │ id (PK)         │
│ title           │   │ buyer_id (FK)   │
│ description     │   │ listing_id (FK) │
│ price           │   │ status          │
│ category        │   │ created_at      │
│ owner_id (FK)   │   └────┬────────────┘
│ created_at      │        │
└────┬────────────┘        │
     │                     │
     │ One-to-Many         │
     └─────────────────────┘
```

## Docker Services Architecture

```
┌─────────────────────────────────────────────────┐
│              Docker Compose Network              │
│                                                  │
│  ┌──────────────┐      ┌──────────────┐        │
│  │   Backend    │      │   Celery     │        │
│  │   (FastAPI)  │      │   Worker     │        │
│  │   Port 8000  │      │              │        │
│  └──────┬───────┘      └──────┬───────┘        │
│         │                     │                 │
│         │                     │                 │
│         ├─────────────────────┤                 │
│         │                     │                 │
│         ▼                     ▼                 │
│  ┌──────────────┐      ┌──────────────┐        │
│  │  PostgreSQL  │      │    Redis     │        │
│  │  Port 5432   │      │  Port 6379   │        │
│  │              │      │              │        │
│  │  (Database)  │      │  (Broker)    │        │
│  └──────────────┘      └──────────────┘        │
│                                                  │
└─────────────────────────────────────────────────┘
```

## Request/Response Cycle

```
Client Request
     │
     ▼
┌─────────────────┐
│  CORS Middleware│
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Router         │
│  (users/        │
│   listings/     │
│   orders)       │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Dependencies   │
│  - get_db()     │
│  - get_current_ │
│    user()       │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Pydantic       │
│  Validation     │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Business Logic │
│  (Route Handler)│
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  SQLAlchemy ORM │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  PostgreSQL     │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Response Model │
│  (Pydantic)     │
└────┬────────────┘
     │
     ▼
Client Response (JSON)
```

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────┐
│                  Internet                        │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│              Load Balancer / CDN                 │
│              (HTTPS/SSL)                         │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│         FastAPI Instances (Auto-scaled)          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Backend 1│  │ Backend 2│  │ Backend 3│      │
│  └──────────┘  └──────────┘  └──────────┘      │
└────────┬────────────────────────────────────────┘
         │
         ├──────────────────┬──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────┐  ┌─────────────┐  ┌─────────────┐
│  RDS PostgreSQL │  │ ElastiCache │  │   Celery    │
│  (Managed DB)   │  │   Redis     │  │   Workers   │
└─────────────────┘  └─────────────┘  └─────────────┘
```

## Security Layers

```
Request
  │
  ▼
┌─────────────────┐
│ 1. HTTPS/TLS    │ ← Encrypted transport
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ 2. CORS Check   │ ← Origin validation
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ 3. JWT Token    │ ← Authentication
│    Verification │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ 4. RBAC Check   │ ← Authorization
│    (Role-based) │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ 5. Input        │ ← Pydantic validation
│    Validation   │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ 6. SQLAlchemy   │ ← SQL injection prevention
│    ORM          │
└────┬────────────┘
     │
     ▼
Protected Resource
```
