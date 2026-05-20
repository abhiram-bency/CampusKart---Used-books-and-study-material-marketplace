# API Usage Examples

Complete guide with curl commands and expected responses.

## Base URL
```
http://localhost:8000
```

---

## 1. Health Check

### Request
```bash
curl http://localhost:8000/health
```

### Response (200 OK)
```json
{
  "status": "healthy",
  "service": "campuskart-api"
}
```

---

## 2. User Registration

### Register Student
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@university.edu",
    "password": "securepass123",
    "role": "student"
  }'
```

### Response (201 Created)
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@university.edu",
  "role": "student",
  "created_at": "2024-01-15T10:30:00.000000"
}
```

### Register Admin
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@university.edu",
    "password": "adminpass123",
    "role": "admin"
  }'
```

---

## 3. User Login

### Request
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=john@university.edu&password=securepass123"
```

### Response (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQHVuaXZlcnNpdHkuZWR1IiwiZXhwIjoxNzA1MzI2MDAwfQ.signature",
  "token_type": "bearer"
}
```

**Save this token for authenticated requests!**

---

## 4. Create Listing (Authenticated)

### Request
```bash
curl -X POST "http://localhost:8000/listings" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Algorithms",
    "description": "CLRS 3rd Edition, excellent condition",
    "price": 75.50,
    "category": "book"
  }'
```

### Response (201 Created)
```json
{
  "id": 1,
  "title": "Introduction to Algorithms",
  "description": "CLRS 3rd Edition, excellent condition",
  "price": 75.5,
  "category": "book",
  "owner_id": 1,
  "created_at": "2024-01-15T10:35:00.000000"
}
```

### Create Hardware Listing
```bash
curl -X POST "http://localhost:8000/listings" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "MacBook Pro 2019",
    "description": "16GB RAM, 512GB SSD, barely used",
    "price": 1200.00,
    "category": "hardware"
  }'
```

---

## 5. Get All Listings (Public)

### Request
```bash
curl "http://localhost:8000/listings?skip=0&limit=10"
```

### Response (200 OK)
```json
[
  {
    "id": 1,
    "title": "Introduction to Algorithms",
    "description": "CLRS 3rd Edition, excellent condition",
    "price": 75.5,
    "category": "book",
    "owner_id": 1,
    "created_at": "2024-01-15T10:35:00.000000"
  },
  {
    "id": 2,
    "title": "MacBook Pro 2019",
    "description": "16GB RAM, 512GB SSD, barely used",
    "price": 1200.0,
    "category": "hardware",
    "owner_id": 1,
    "created_at": "2024-01-15T10:36:00.000000"
  }
]
```

### Pagination
```bash
# Get next page
curl "http://localhost:8000/listings?skip=10&limit=10"

# Get first 5 items
curl "http://localhost:8000/listings?skip=0&limit=5"
```

---

## 6. Get Single Listing

### Request
```bash
curl "http://localhost:8000/listings/1"
```

### Response (200 OK)
```json
{
  "id": 1,
  "title": "Introduction to Algorithms",
  "description": "CLRS 3rd Edition, excellent condition",
  "price": 75.5,
  "category": "book",
  "owner_id": 1,
  "created_at": "2024-01-15T10:35:00.000000"
}
```

### Not Found (404)
```bash
curl "http://localhost:8000/listings/999"
```
```json
{
  "detail": "Listing not found"
}
```

---

## 7. Update Listing (Owner or Admin)

### Request
```bash
curl -X PUT "http://localhost:8000/listings/1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 65.00,
    "description": "Updated: Price reduced!"
  }'
```

### Response (200 OK)
```json
{
  "id": 1,
  "title": "Introduction to Algorithms",
  "description": "Updated: Price reduced!",
  "price": 65.0,
  "category": "book",
  "owner_id": 1,
  "created_at": "2024-01-15T10:35:00.000000"
}
```

### Unauthorized (403)
```json
{
  "detail": "Not authorized to update this listing"
}
```

---

## 8. Delete Listing (Owner or Admin)

### Request
```bash
curl -X DELETE "http://localhost:8000/listings/1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Response (204 No Content)
No response body

---

## 9. Create Order (Authenticated)

### Request
```bash
curl -X POST "http://localhost:8000/orders" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "listing_id": 2
  }'
```

### Response (201 Created)
```json
{
  "id": 1,
  "buyer_id": 2,
  "listing_id": 2,
  "status": "pending",
  "created_at": "2024-01-15T10:40:00.000000"
}
```

**Note**: Background task triggered to send notification!

### Cannot Buy Own Listing (400)
```json
{
  "detail": "Cannot buy your own listing"
}
```

### Listing Not Found (404)
```json
{
  "detail": "Listing not found"
}
```

---

## 10. Get My Orders (Authenticated)

### Request
```bash
curl "http://localhost:8000/orders/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Response (200 OK)
```json
[
  {
    "id": 1,
    "buyer_id": 2,
    "listing_id": 2,
    "status": "pending",
    "created_at": "2024-01-15T10:40:00.000000",
    "listing": {
      "id": 2,
      "title": "MacBook Pro 2019",
      "description": "16GB RAM, 512GB SSD, barely used",
      "price": 1200.0,
      "category": "hardware",
      "owner_id": 1,
      "created_at": "2024-01-15T10:36:00.000000"
    }
  }
]
```

---

## 11. Get All Orders (Admin Only)

### Request
```bash
curl "http://localhost:8000/orders" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### Response (200 OK)
```json
[
  {
    "id": 1,
    "buyer_id": 2,
    "listing_id": 2,
    "status": "pending",
    "created_at": "2024-01-15T10:40:00.000000",
    "listing": {
      "id": 2,
      "title": "MacBook Pro 2019",
      "description": "16GB RAM, 512GB SSD, barely used",
      "price": 1200.0,
      "category": "hardware",
      "owner_id": 1,
      "created_at": "2024-01-15T10:36:00.000000"
    }
  }
]
```

### Forbidden (403)
```json
{
  "detail": "Admin access required"
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 400 Bad Request (Validation Error)
```json
{
  "detail": [
    {
      "loc": ["body", "price"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

---

## Using Postman

1. Import collection from Swagger: `http://localhost:8000/docs`
2. Set environment variable `token` with your JWT
3. Use `{{token}}` in Authorization headers

---

## Using Python Requests

```python
import requests

BASE_URL = "http://localhost:8000"

# Register
response = requests.post(f"{BASE_URL}/auth/register", json={
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
})
print(response.json())

# Login
response = requests.post(f"{BASE_URL}/auth/login", data={
    "username": "test@example.com",
    "password": "password123"
})
token = response.json()["access_token"]

# Create listing
headers = {"Authorization": f"Bearer {token}"}
response = requests.post(f"{BASE_URL}/listings", json={
    "title": "Test Book",
    "price": 50.0,
    "category": "book"
}, headers=headers)
print(response.json())
```

---

## Testing with test_api.py

Run the included test script:
```bash
python test_api.py
```

This will:
1. Register multiple users
2. Login and get tokens
3. Create listings
4. Create orders
5. Test all endpoints
