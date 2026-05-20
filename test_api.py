"""
API Test Script for CampusKart
Run this after starting the application to test all endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    print("\n=== Testing Health Check ===")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

def test_register():
    print("\n=== Testing User Registration ===")
    users = [
        {
            "name": "Alice Student",
            "email": "alice@university.edu",
            "password": "password123",
            "role": "student"
        },
        {
            "name": "Bob Student",
            "email": "bob@university.edu",
            "password": "password123",
            "role": "student"
        },
        {
            "name": "Admin User",
            "email": "admin@university.edu",
            "password": "admin123",
            "role": "admin"
        }
    ]
    
    for user in users:
        response = requests.post(f"{BASE_URL}/auth/register", json=user)
        print(f"Registering {user['name']}: {response.status_code}")
        if response.status_code == 201:
            print(f"Success: {response.json()}")

def test_login(email, password):
    print(f"\n=== Testing Login for {email} ===")
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": email, "password": password}
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"Token received: {token[:50]}...")
        return token
    return None

def test_create_listing(token):
    print("\n=== Testing Create Listing ===")
    listings = [
        {
            "title": "Introduction to Algorithms Textbook",
            "description": "3rd Edition, excellent condition",
            "price": 75.00,
            "category": "book"
        },
        {
            "title": "MacBook Pro 2019",
            "description": "16GB RAM, 512GB SSD, barely used",
            "price": 1200.00,
            "category": "hardware"
        }
    ]
    
    headers = {"Authorization": f"Bearer {token}"}
    listing_ids = []
    
    for listing in listings:
        response = requests.post(f"{BASE_URL}/listings", json=listing, headers=headers)
        print(f"Creating '{listing['title']}': {response.status_code}")
        if response.status_code == 201:
            listing_id = response.json()["id"]
            listing_ids.append(listing_id)
            print(f"Created with ID: {listing_id}")
    
    return listing_ids

def test_get_listings():
    print("\n=== Testing Get All Listings ===")
    response = requests.get(f"{BASE_URL}/listings")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        listings = response.json()
        print(f"Found {len(listings)} listings")
        for listing in listings:
            print(f"  - {listing['title']}: ${listing['price']}")

def test_create_order(token, listing_id):
    print(f"\n=== Testing Create Order for Listing {listing_id} ===")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/orders",
        json={"listing_id": listing_id},
        headers=headers
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        print(f"Order created: {response.json()}")
        return response.json()["id"]
    else:
        print(f"Error: {response.json()}")
    return None

def test_get_my_orders(token):
    print("\n=== Testing Get My Orders ===")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/orders/me", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        orders = response.json()
        print(f"Found {len(orders)} orders")
        for order in orders:
            print(f"  - Order {order['id']}: Status {order['status']}")

def test_admin_get_all_orders(admin_token):
    print("\n=== Testing Admin Get All Orders ===")
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.get(f"{BASE_URL}/orders", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        orders = response.json()
        print(f"Total orders in system: {len(orders)}")

def run_all_tests():
    print("=" * 60)
    print("CampusKart API Test Suite")
    print("=" * 60)
    
    # Test health
    test_health()
    
    # Register users
    test_register()
    
    # Login as Alice
    alice_token = test_login("alice@university.edu", "password123")
    
    # Login as Bob
    bob_token = test_login("bob@university.edu", "password123")
    
    # Login as Admin
    admin_token = test_login("admin@university.edu", "admin123")
    
    if not alice_token or not bob_token:
        print("\nLogin failed. Cannot continue tests.")
        return
    
    # Alice creates listings
    listing_ids = test_create_listing(alice_token)
    
    # Get all listings
    test_get_listings()
    
    # Bob creates an order for Alice's listing
    if listing_ids:
        test_create_order(bob_token, listing_ids[0])
    
    # Bob checks his orders
    test_get_my_orders(bob_token)
    
    # Admin views all orders
    if admin_token:
        test_admin_get_all_orders(admin_token)
    
    print("\n" + "=" * 60)
    print("Test Suite Completed!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        run_all_tests()
    except requests.exceptions.ConnectionError:
        print("\nError: Cannot connect to API. Make sure the server is running at http://localhost:8000")
    except Exception as e:
        print(f"\nError: {e}")
