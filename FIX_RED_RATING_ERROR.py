#!/usr/bin/env python3
import requests
import json
import subprocess
import sys

print("=== FIXING RED RATING ERROR ===")
print()

# Step 1: Check all possible error sources
print("1. Checking Spring Boot health...")
try:
    response = requests.get("http://localhost:8081/api/recommendations/user/1/ratings", timeout=5)
    if response.status_code == 200:
        print("   Spring Boot: OK")
    else:
        print(f"   Spring Boot: ERROR - Status {response.status_code}")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   Spring Boot: ERROR - {e}")
    print("   Starting Spring Boot...")
    subprocess.run(['start', 'cmd', '/k', 'cd /d "c:\\Users\\User\\Downloads\\myMealbasket" && mvn spring-boot:run'], shell=True)
    input("Wait for Spring Boot to start, then press Enter to continue...")

# Step 2: Check database connection and table
print("\n2. Checking database and table...")
try:
    # Check if database exists
    result = subprocess.run(['psql', '-U', 'postgres', '-p', '5433', '-c', 'SELECT 1;'], capture_output=True, text=True, timeout=10)
    if result.returncode != 0:
        print("   PostgreSQL: NOT CONNECTED")
        print("   Please check PostgreSQL service")
        sys.exit(1)
    
    # Check if ratings table exists
    result = subprocess.run(['psql', '-U', 'postgres', '-d', 'mealbasketsystem', '-p', '5433', 
                           '-c', 'SELECT COUNT(*) FROM ratings;'], capture_output=True, text=True, timeout=10)
    if result.returncode != 0:
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
    else:
        count = result.stdout.strip().split('\n')[1]
        print(f"   Ratings table: EXISTS with {count} records")
        
except Exception as e:
    print(f"   Database error: {e}")
    sys.exit(1)

# Step 3: Test rating submission with detailed error checking
print("\n3. Testing rating submission...")
test_data = {
    "userId": 1,
    "productId": 123,
    "rating": 4
}

try:
    print(f"   Sending: {json.dumps(test_data)}")
    response = requests.post(
        "http://localhost:8081/api/recommendations/rate",
        headers={"Content-Type": "application/json"},
        json=test_data,
        timeout=10
    )
    
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text}")
    
    if response.status_code == 200:
        result = response.json()
        if result.get('success', False):
            print("   Rating submission: SUCCESS")
        else:
            print(f"   Rating submission: FAILED - {result.get('message', 'Unknown error')}")
    else:
        print(f"   Rating submission: FAILED - Status {response.status_code}")
        
except Exception as e:
    print(f"   Rating submission: ERROR - {e}")

# Step 4: Verify database storage
print("\n4. Verifying database storage...")
try:
    result = subprocess.run(['psql', '-U', 'postgres', '-d', 'mealbasketsystem', '-p', '5433', 
                           '-c', 'SELECT user_id, product_id, rating, created_at FROM ratings WHERE user_id = 1 AND product_id = 123 ORDER BY created_at DESC LIMIT 1;'], 
                          capture_output=True, text=True, timeout=10)
    print("   Database result:")
    print(result.stdout)
    
    if "123" in result.stdout:
        print("   Database storage: SUCCESS")
    else:
        print("   Database storage: FAILED - No rating found")
        
except Exception as e:
    print(f"   Database verification: ERROR - {e}")

# Step 5: Test frontend API calls
print("\n5. Testing frontend API calls...")
try:
    # Test user ratings endpoint
    response = requests.get("http://localhost:8081/api/recommendations/user/1/ratings", timeout=10)
    if response.status_code == 200:
        ratings = response.json()
        print(f"   User ratings: {len(ratings)} found")
        for rating in ratings:
            print(f"     Product {rating.get('product', {}).get('id', 'N/A')}: {rating.get('rating', 'N/A')}")
    else:
        print(f"   User ratings: FAILED - Status {response.status_code}")
        
    # Test specific product rating
    response = requests.get("http://localhost:8081/api/recommendations/user/1/product/123/rating", timeout=10)
    if response.status_code == 200:
        rating = response.json()
        print(f"   Product 123 rating: {rating.get('rating', 'N/A')}")
    else:
        print(f"   Product 123 rating: FAILED - Status {response.status_code}")
        
except Exception as e:
    print(f"   Frontend API test: ERROR - {e}")

print("\n=== RED RATING ERROR DIAGNOSIS COMPLETE ===")
print()
print("COMMON ISSUES AND FIXES:")
print("1. Spring Boot not running -> Start with 'mvn spring-boot:run'")
print("2. Database not connected -> Check PostgreSQL service")
print("3. Ratings table missing -> Created automatically")
print("4. API endpoint failing -> Check backend logs")
print("5. Frontend not calling API -> Check browser console")
print("6. CORS issues -> Check application.properties")
print()
print("NEXT STEPS:")
print("1. Open browser: http://localhost:3001")
print("2. Open browser console (F12)")
print("3. Try to rate a product")
print("4. Check console for error messages")
print("5. Look for red color indicators")
print("6. Check network tab for failed API calls")
print()

input("Press Enter to continue with browser testing...")
