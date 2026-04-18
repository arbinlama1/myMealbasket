#!/usr/bin/env python3
import requests
import json
import subprocess
import time
import sys

print("=== DIAGNOSING PERSISTENCE ISSUE ===")
print()

# Test 1: Check if backend is running with RatingController
print("1. Checking RatingController status...")
try:
    response = requests.get("http://localhost:8081/api/ratings/health", timeout=5)
    if response.status_code == 200:
        print("   RatingController: RUNNING")
    else:
        print(f"   RatingController: Status {response.status_code}")
        print("   Please restart Spring Boot with RatingController")
        sys.exit(1)
except Exception as e:
    print(f"   RatingController: NOT RUNNING - {e}")
    print("   Please start Spring Boot first!")
    sys.exit(1)

# Test 2: Check database connection and table
print("\n2. Checking database and ratings table...")
try:
    # Check if ratings table exists
    result = subprocess.run(['psql', '-U', 'postgres', '-d', 'mealbasketsystem', '-p', '5433', 
                           '-c', 'SELECT COUNT(*) FROM ratings;'], capture_output=True, text=True, timeout=10)
    if result.returncode == 0:
        count = result.stdout.strip().split('\n')[1]
        print(f"   Ratings table: EXISTS with {count} records")
    else:
        print("   Ratings table: NOT FOUND - Creating...")
        create_sql = """
        CREATE TABLE IF NOT EXISTS ratings (
            id BIGSERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL,
            product_id BIGINT NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
        );
        """
        subprocess.run(['psql', '-U', 'postgres', '-d', 'mealbasketsystem', '-p', '5433', '-c', create_sql], capture_output=True, text=True)
        print("   Ratings table: CREATED")
        
except Exception as e:
    print(f"   Database check: ERROR - {e}")
    sys.exit(1)

# Test 3: Test rating submission
print("\n3. Testing rating submission...")
test_data = {
    "userId": 1,
    "productId": 555,
    "rating": 4
}

try:
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
        else:
            print(f"   Rating submission: FAILED - {result.get('message', 'Unknown')}")
    else:
        print("   Rating submission: FAILED")
        
except Exception as e:
    print(f"   Rating submission: ERROR - {e}")

# Test 4: IMMEDIATE database verification
print("\n4. IMMEDIATE database verification...")
time.sleep(1)  # Wait for database commit

try:
    result = subprocess.run(['psql', '-U', 'postgres', '-d', 'mealbasketsystem', '-p', '5433', 
                           '-c': 'SELECT user_id, product_id, rating, created_at FROM ratings WHERE user_id = 1 AND product_id = 555 ORDER BY created_at DESC LIMIT 1;'], 
                          capture_output=True, text=True, timeout=10)
    if result.returncode == 0:
        lines = result.stdout.strip().split('\n')
        if len(lines) > 2:  # Header + data
            print("   Database storage: IMMEDIATE SUCCESS")
            for line in lines[1:]:
                if line.strip():
                    print(f"   Stored: {line}")
        else:
            print("   Database storage: FAILED - No rating found")
            print("   ISSUE: Transaction not committed or database not saving")
    else:
        print(f"   Database verification: ERROR - {result.stderr}")
        
except Exception as e:
    print(f"   Database verification: ERROR - {e}")

# Test 5: Test rating retrieval
print("\n5. Testing rating retrieval...")
try:
    response = requests.get("http://localhost:8081/api/ratings/user/1/product/555", timeout=10)
    print(f"   GET /api/ratings/user/1/product/555: Status {response.status_code}")
    if response.status_code == 200:
        rating = response.json()
        if rating:
            print(f"   Rating retrieval: SUCCESS - {rating}")
        else:
            print("   Rating retrieval: FAILED - No rating returned")
    else:
        print(f"   Rating retrieval: FAILED - Status {response.status_code}")
        
except Exception as e:
    print(f"   Rating retrieval: ERROR - {e}")

# Test 6: Test all user ratings
print("\n6. Testing all user ratings...")
try:
    response = requests.get("http://localhost:8081/api/ratings/user/1", timeout=10)
    print(f"   GET /api/ratings/user/1: Status {response.status_code}")
    if response.status_code == 200:
        ratings = response.json()
        print(f"   All ratings: Found {len(ratings)} ratings")
        for rating in ratings:
            print(f"     Rating: Product {rating.get('product', {}).get('id', 'N/A')} -> {rating.get('rating', 'N/A')}")
    else:
        print(f"   All ratings: FAILED - Status {response.status_code}")
        
except Exception as e:
    print(f"   All ratings: ERROR - {e}")

# Test 7: Check transaction issues
print("\n7. Checking transaction issues...")
try:
    # Test if @Transactional is working
    result = subprocess.run(['psql', '-U', 'postgres', '-d', 'mealbasketsystem', '-p', '5433', 
                           '-c': 'SELECT COUNT(*) FROM ratings;'], capture_output=True, text=True, timeout=10)
    initial_count = int(result.stdout.strip().split('\n')[1])
    
    # Submit another rating
    test_data2 = {"userId": 2, "productId": 666, "rating": 5}
    response = requests.post("http://localhost:8081/api/ratings/rate", 
                           headers={"Content-Type": "application/json"}, 
                           json=test_data2, timeout=10)
    
    # Check count again
    time.sleep(1)
    result = subprocess.run(['psql', '-U', 'postgres', '-d', 'mealbasketsystem', '-p', '5433', 
                           '-c': 'SELECT COUNT(*) FROM ratings;'], capture_output=True, text=True, timeout=10)
    final_count = int(result.stdout.strip().split('\n')[1])
    
    if final_count > initial_count:
        print("   Transaction: WORKING - Database count increased")
    else:
        print("   Transaction: FAILED - Database count not increased")
        print("   ISSUE: @Transactional not working or database not committing")
        
except Exception as e:
    print(f"   Transaction check: ERROR - {e}")

print("\n=== PERSISTENCE ISSUE DIAGNOSIS COMPLETE ===")
print()
print("COMMON PERSISTENCE ISSUES:")
print("1. @Transactional annotation missing or not working")
print("2. Database connection issues")
print("3. Repository.save() not committing")
print("4. Database transaction rollback")
print("5. Frontend not calling correct API")
print("6. API endpoint mapping issues")
print()
print("NEXT STEPS:")
print("1. Check backend logs for transaction errors")
print("2. Verify @Transactional annotation in RatingController")
print("3. Check database connection settings")
print("4. Test with different users/products")
print("5. Check frontend API calls in browser console")
print()
print("EXPECTED RESULTS:")
print("- Rating submission: 200 OK")
print("- Database storage: Rating found immediately")
print("- Rating retrieval: Same rating returned")
print("- All ratings: Rating included in array")
print("- Transaction: Database count increases")
