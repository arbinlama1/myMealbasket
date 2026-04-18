#!/usr/bin/env python3
import requests
import json
import time
import subprocess
import sys
from datetime import datetime

print("=== API CONNECTIVITY TEST ===")
print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print()

# Step 1: Check if backend is running
print("1. Testing backend connectivity...")
try:
    response = requests.get("http://localhost:8081/api/recommendations/health", timeout=5)
    if response.status_code == 200:
        print("   Backend: RUNNING and responding")
        print(f"   Health check: {response.json()}")
    else:
        print(f"   Backend: Responding with status {response.status_code}")
except requests.exceptions.ConnectionError:
    print("   Backend: NOT RUNNING - Connection refused")
    print("   Please start Spring Boot first!")
    sys.exit(1)
except Exception as e:
    print(f"   Backend: ERROR - {e}")
    sys.exit(1)

# Step 2: Test all rating endpoints
print("\n2. Testing rating endpoints...")

# Test GET user ratings
try:
    response = requests.get("http://localhost:8081/api/recommendations/user/1/ratings", timeout=10)
    print(f"   GET /user/1/ratings: Status {response.status_code}")
    if response.status_code == 200:
        ratings = response.json()
        print(f"   Response: Found {len(ratings)} ratings")
    else:
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   GET /user/1/ratings: ERROR - {e}")

# Test GET specific product rating
try:
    response = requests.get("http://localhost:8081/api/recommendations/user/1/product/999/rating", timeout=10)
    print(f"   GET /user/1/product/999/rating: Status {response.status_code}")
    if response.status_code == 200:
        rating = response.json()
        print(f"   Response: {rating}")
    else:
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   GET /user/1/product/999/rating: ERROR - {e}")

# Test POST rating submission
try:
    test_data = {
        "userId": 1,
        "productId": 999,
        "rating": 4
    }
    print(f"   POST /rate: Sending {json.dumps(test_data)}")
    response = requests.post(
        "http://localhost:8081/api/recommendations/rate",
        headers={"Content-Type": "application/json"},
        json=test_data,
        timeout=10
    )
    print(f"   POST /rate: Status {response.status_code}")
    print(f"   POST /rate: Response {response.text}")
    
    if response.status_code == 200:
        result = response.json()
        if result.get('success', False):
            print("   POST /rate: SUCCESS - Rating submitted")
        else:
            print(f"   POST /rate: FAILED - {result.get('message', 'Unknown error')}")
    else:
        print("   POST /rate: FAILED - HTTP error")
        
except Exception as e:
    print(f"   POST /rate: ERROR - {e}")

# Step 3: Check network connectivity from port 3001
print("\n3. Testing CORS from port 3001...")
try:
    response = requests.get(
        "http://localhost:8081/api/recommendations/user/1/ratings",
        headers={"Origin": "http://localhost:3001"},
        timeout=10
    )
    print(f"   CORS test from port 3001: Status {response.status_code}")
    if response.status_code == 200:
        print("   CORS: Working from port 3001")
    else:
        print("   CORS: May be blocked from port 3001")
except Exception as e:
    print(f"   CORS test: ERROR - {e}")

# Step 4: Test with different origins
print("\n4. Testing CORS with different origins...")
origins = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3001"]
for origin in origins:
    try:
        response = requests.get(
            "http://localhost:8081/api/recommendations/user/1/ratings",
            headers={"Origin": origin},
            timeout=5
        )
        print(f"   Origin {origin}: Status {response.status_code}")
    except Exception as e:
        print(f"   Origin {origin}: ERROR - {e}")

# Step 5: Check if requests are actually reaching backend
print("\n5. Monitoring backend logs...")
print("   To monitor backend logs:")
print("   1. Check Spring Boot console output")
print("   2. Look for rating request logs")
print("   3. Check for any error messages")
print("   4. Verify @RequestBody is being called")
print("   5. Check database connection logs")

# Step 6: Simulate frontend request
print("\n6. Simulating frontend request...")
try:
    # Simulate exactly what frontend sends
    frontend_headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    response = requests.post(
        "http://localhost:8081/api/recommendations/rate",
        headers=frontend_headers,
        json=test_data,
        timeout=10
    )
    print(f"   Frontend simulation: Status {response.status_code}")
    print(f"   Frontend simulation: Response {response.text}")
    
except Exception as e:
    print(f"   Frontend simulation: ERROR - {e}")

# Step 7: Database verification
print("\n7. Verifying database storage...")
time.sleep(2)  # Wait for potential database commit

try:
    result = subprocess.run(['psql', '-U', 'postgres', '-d', 'mealbasketsystem', '-p', '5433', 
                           '-c', 'SELECT COUNT(*) FROM ratings WHERE user_id = 1 AND product_id = 999;'], 
                          capture_output=True, text=True, timeout=10)
    if result.returncode == 0:
        count = result.stdout.strip().split('\n')[1]
        print(f"   Database verification: Found {count} ratings for user 1, product 999")
        if int(count) > 0:
            print("   Database verification: SUCCESS - Rating was stored")
        else:
            print("   Database verification: FAILED - Rating was not stored")
    else:
        print(f"   Database verification: ERROR - {result.stderr}")
except Exception as e:
    print(f"   Database verification: ERROR - {e}")

print("\n=== API CONNECTIVITY TEST COMPLETE ===")
print()
print("SUMMARY:")
print("1. Backend should be RUNNING on port 8081")
print("2. All API endpoints should respond with 200")
print("3. CORS should allow port 3001")
print("4. Frontend requests should reach backend")
print("5. Database should store ratings")
print()
print("If any step fails, that's the issue to fix!")
print()
print("NEXT STEPS:")
print("1. Check browser console (F12) for API calls")
print("2. Check Network tab for failed requests")
print("3. Check backend logs for request handling")
print("4. Verify database storage")
print("5. Test with different browsers")
