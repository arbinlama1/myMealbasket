#!/usr/bin/env python3
import requests
import json

print("=== QUICK PERSISTENCE CHECK ===")
print()

# Test 1: Check backend
print("1. Checking backend...")
try:
    response = requests.get("http://localhost:8081/api/ratings/health", timeout=5)
    if response.status_code == 200:
        print("   Backend: RUNNING")
        print(f"   Response: {response.json()}")
    else:
        print(f"   Backend: Status {response.status_code}")
        print("   Please start Spring Boot!")
        exit(1)
except Exception as e:
    print(f"   Backend: ERROR - {e}")
    print("   Please start Spring Boot!")
    exit(1)

# Test 2: Test rating submission
print("\n2. Testing rating submission...")
try:
    test_data = {"userId": 1, "productId": 333, "rating": 4}
    response = requests.post(
        "http://localhost:8081/api/ratings/rate",
        headers={"Content-Type": "application/json"},
        json=test_data,
        timeout=10
    )
    print(f"   POST /api/ratings/rate: Status {response.status_code}")
    print(f"   Response: {response.text}")
    
    if response.status_code == 200:
        result = response.json()
        if result.get('success', False):
            print("   Rating submission: SUCCESS")
        else:
            print(f"   Rating submission: FAILED - {result.get('message', 'Unknown')}")
    else:
        print("   Rating submission: FAILED")
        
except Exception as e:
    print(f"   Rating submission: ERROR - {e}")

# Test 3: Test retrieval
print("\n3. Testing rating retrieval...")
try:
    response = requests.get("http://localhost:8081/api/ratings/user/1/product/333", timeout=10)
    print(f"   GET /api/ratings/user/1/product/333: Status {response.status_code}")
    if response.status_code == 200:
        rating = response.json()
        if rating:
            print(f"   Rating retrieval: SUCCESS - {rating}")
        else:
            print("   Rating retrieval: No rating found")
    else:
        print(f"   Rating retrieval: FAILED")
        
except Exception as e:
    print(f"   Rating retrieval: ERROR - {e}")

print("\n=== PERSISTENCE CHECK COMPLETE ===")
print()
print("If all tests show SUCCESS, persistence is working!")
print("If tests show FAILED, that's the issue to fix!")
