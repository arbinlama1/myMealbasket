#!/usr/bin/env python3
import requests
import json
import subprocess
import time
import sys

print("=== TEST SAME RESULT - RATING SYSTEM VERIFICATION ===")
print()

# Test 1: Verify RatingController is working
print("1. Testing RatingController health...")
try:
    response = requests.get("http://localhost:8081/api/ratings/health", timeout=5)
    if response.status_code == 200:
        print("   RatingController: WORKING")
        print(f"   Health check: {response.json()}")
    else:
        print(f"   RatingController: Status {response.status_code}")
        print("   Please start Spring Boot with RatingController")
except Exception as e:
    print(f"   RatingController: ERROR - {e}")
    sys.exit(1)

# Test 2: Test user ratings endpoint
print("\n2. Testing user ratings endpoint...")
try:
    response = requests.get("http://localhost:8081/api/ratings/user/1", timeout=10)
    print(f"   GET /api/ratings/user/1: Status {response.status_code}")
    if response.status_code == 200:
        ratings = response.json()
        print(f"   Response: Found {len(ratings)} ratings")
        for rating in ratings:
            print(f"     Rating ID: {rating.get('id')}, Product: {rating.get('product', {}).get('id', 'N/A')}, Score: {rating.get('rating')}")
    else:
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   User ratings: ERROR - {e}")

# Test 3: Test specific product rating endpoint
print("\n3. Testing specific product rating...")
try:
    response = requests.get("http://localhost:8081/api/ratings/user/1/product/999", timeout=10)
    print(f"   GET /api/ratings/user/1/product/999: Status {response.status_code}")
    if response.status_code == 200:
        rating = response.json()
        if rating:
            print(f"   Response: Found rating - Product {rating.get('product', {}).get('id', 'N/A')}, Score {rating.get('rating')}")
        else:
            print("   Response: No rating found")
    else:
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   Product rating: ERROR - {e}")

# Test 4: Test rating submission (SAME RESULT)
print("\n4. Testing rating submission - EXPECTING SAME RESULT...")
try:
    test_data = {
        "userId": 1,
        "productId": 777,
        "rating": 4
    }
    
    print(f"   Sending: {json.dumps(test_data)}")
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
            print(f"   Action: {result.get('action', 'unknown')}")
            print(f"   User rating: {result.get('userRating', 'N/A')}")
            print(f"   Average rating: {result.get('averageRating', 'N/A')}")
            print(f"   Rating count: {result.get('ratingCount', 'N/A')}")
        else:
            print(f"   Rating submission: FAILED - {result.get('message', 'Unknown')}")
    else:
        print("   Rating submission: FAILED")
        
except Exception as e:
    print(f"   Rating submission: ERROR - {e}")

# Test 5: Verify database storage (SAME RESULT)
print("\n5. Verifying database storage - EXPECTING SAME RESULT...")
time.sleep(2)  # Wait for database commit

try:
    result = subprocess.run(['psql', '-U', 'postgres', '-d', 'mealbasketsystem', '-p', '5433', 
                           '-c', 'SELECT user_id, product_id, rating, created_at FROM ratings WHERE user_id = 1 AND product_id = 777 ORDER BY created_at DESC LIMIT 1;'], 
                          capture_output=True, text=True, timeout=10)
    if result.returncode == 0:
        lines = result.stdout.strip().split('\n')
        if len(lines) > 2:  # Header + data
            print("   Database storage: SUCCESS - SAME RESULT EXPECTED")
            for line in lines[1:]:
                if line.strip():
                    print(f"   Stored: {line}")
        else:
            print("   Database storage: FAILED - No rating found")
    else:
        print(f"   Database verification: ERROR - {result.stderr}")
        
except Exception as e:
    print(f"   Database verification: ERROR - {e}")

# Test 6: Test rating retrieval (SAME RESULT)
print("\n6. Testing rating retrieval - EXPECTING SAME RESULT...")
try:
    response = requests.get("http://localhost:8081/api/ratings/user/1/product/777", timeout=10)
    print(f"   GET /api/ratings/user/1/product/777: Status {response.status_code}")
    if response.status_code == 200:
        rating = response.json()
        if rating:
            print(f"   Rating retrieval: SUCCESS - SAME RESULT")
            print(f"   Retrieved: Product {rating.get('product', {}).get('id', 'N/A')}, Score {rating.get('rating')}")
        else:
            print("   Rating retrieval: No rating found")
    else:
        print(f"   Rating retrieval: FAILED - Status {response.status_code}")
        
except Exception as e:
    print(f"   Rating retrieval: ERROR - {e}")

# Test 7: Test all user ratings (SAME RESULT)
print("\n7. Testing all user ratings - EXPECTING SAME RESULT...")
try:
    response = requests.get("http://localhost:8081/api/ratings/user/1", timeout=10)
    print(f"   GET /api/ratings/user/1: Status {response.status_code}")
    if response.status_code == 200:
        ratings = response.json()
        print(f"   All ratings: SUCCESS - Found {len(ratings)} ratings")
        for rating in ratings:
            print(f"     Rating: Product {rating.get('product', {}).get('id', 'N/A')} -> {rating.get('rating')}")
    else:
        print(f"   All ratings: FAILED - Status {response.status_code}")
        
except Exception as e:
    print(f"   All ratings: ERROR - {e}")

print("\n=== SAME RESULT TEST COMPLETE ===")
print()
print("EXPECTED RESULTS:")
print("1. RatingController: WORKING")
print("2. User ratings: 200 OK with ratings array")
print("3. Product rating: 200 OK with rating object")
print("4. Rating submission: 200 OK with success=true")
print("5. Database storage: SUCCESS with rating data")
print("6. Rating retrieval: 200 OK with same rating")
print("7. All ratings: 200 OK with updated ratings array")
print()
print("SAME RESULT EXPECTED:")
print("- Rating submitted successfully")
print("- Rating stored in database")
print("- Rating retrieved correctly")
print("- All endpoints working")
print("- Frontend and backend synchronized")
print()
print("If all tests pass, you get the SAME RESULT as expected!")
