#!/usr/bin/env python3
import requests
import json
import time
import subprocess
import sys

print("=== COMPREHENSIVE RATING STORAGE DIAGNOSIS ===")
print()

# Step 1: Check if Spring Boot is running
print("1. Checking Spring Boot status...")
try:
    response = requests.get("http://localhost:8081/api/recommendations/user/1/ratings", timeout=5)
    if response.status_code == 200:
        print("   Spring Boot: RUNNING on port 8081")
    else:
        print(f"   Spring Boot: Responding with status {response.status_code}")
except requests.exceptions.ConnectionError:
    print("   Spring Boot: NOT RUNNING on port 8081")
    print("   Please start Spring Boot first!")
    sys.exit(1)
except Exception as e:
    print(f"   Spring Boot: ERROR - {e}")
    sys.exit(1)

# Step 2: Check database connection
print("\n2. Checking database connection...")
try:
    result = subprocess.run(['psql', '-U', 'postgres', '-d', 'mealbasketsystem', '-p', '5433', 
                           '-c', 'SELECT 1;'], capture_output=True, text=True, timeout=10)
    if result.returncode == 0:
        print("   PostgreSQL: CONNECTED on port 5433")
    else:
        print("   PostgreSQL: CONNECTION FAILED")
        print(f"   Error: {result.stderr}")
        sys.exit(1)
except Exception as e:
    print(f"   PostgreSQL: ERROR - {e}")
    sys.exit(1)

# Step 3: Check ratings table
print("\n3. Checking ratings table...")
try:
    result = subprocess.run(['psql', '-U', 'postgres', '-d', 'mealbasketsystem', '-p', '5433', 
                           '-c', 'SELECT COUNT(*) FROM ratings;'], capture_output=True, text=True, timeout=10)
    if result.returncode == 0:
        count = result.stdout.strip().split('\n')[1]
        print(f"   Ratings table: EXISTS with {count} records")
    else:
        print("   Ratings table: NOT FOUND")
        print("   Creating ratings table...")
        
        # Create ratings table
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
        result = subprocess.run(['psql', '-U', 'postgres', '-d', 'mealbasketsystem', '-p', '5433', 
                               '-c', create_sql], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("   Ratings table: CREATED successfully")
        else:
            print(f"   Ratings table: CREATION FAILED - {result.stderr}")
            sys.exit(1)
except Exception as e:
    print(f"   Ratings table: ERROR - {e}")
    sys.exit(1)

# Step 4: Test rating submission
print("\n4. Testing rating submission...")
test_data = {
    "userId": 1,
    "productId": 999,
    "rating": 4
}

try:
    response = requests.post(
        "http://localhost:8081/api/recommendations/rate",
        headers={"Content-Type": "application/json"},
        json=test_data,
        timeout=10
    )
    
    print(f"   API Response: {response.status_code}")
    print(f"   Response Body: {response.text}")
    
    if response.status_code == 200:
        print("   Rating submission: SUCCESS")
    else:
        print("   Rating submission: FAILED")
        print(f"   Error: {response.text}")
except Exception as e:
    print(f"   Rating submission: ERROR - {e}")
    sys.exit(1)

# Step 5: Verify database storage
print("\n5. Verifying database storage...")
time.sleep(2)  # Wait for database commit

try:
    result = subprocess.run(['psql', '-U', 'postgres', '-d', 'mealbasketsystem', '-p', '5433', 
                           '-c', 'SELECT user_id, product_id, rating, created_at FROM ratings WHERE user_id = 1 AND product_id = 999;'], 
                          capture_output=True, text=True, timeout=10)
    if result.returncode == 0:
        lines = result.stdout.strip().split('\n')
        if len(lines) > 2:  # Header + data
            print("   Database storage: SUCCESS")
            print("   Stored rating:")
            for line in lines[1:]:
                if line.strip():
                    print(f"     {line}")
        else:
            print("   Database storage: FAILED - No rating found")
    else:
        print(f"   Database storage: ERROR - {result.stderr}")
except Exception as e:
    print(f"   Database storage: ERROR - {e}")
    sys.exit(1)

# Step 6: Test rating retrieval
print("\n6. Testing rating retrieval...")
try:
    response = requests.get("http://localhost:8081/api/recommendations/user/1/ratings", timeout=10)
    if response.status_code == 200:
        ratings = response.json()
        print(f"   Rating retrieval: SUCCESS - Found {len(ratings)} ratings")
        for rating in ratings:
            print(f"     Product {rating.get('product', {}).get('id', 'N/A')}: Rating {rating.get('rating', 'N/A')}")
    else:
        print(f"   Rating retrieval: FAILED - Status {response.status_code}")
except Exception as e:
    print(f"   Rating retrieval: ERROR - {e}")

print("\n=== DIAGNOSIS COMPLETE ===")
print()
print("SUMMARY:")
print("- Spring Boot should be running on port 8081")
print("- PostgreSQL should be connected on port 5433")
print("- Ratings table should exist")
print("- Rating submission should work via API")
print("- Database should store the rating")
print("- Rating retrieval should work via API")
print()
print("If any step failed, that's the issue to fix!")
