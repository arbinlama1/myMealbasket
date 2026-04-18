#!/usr/bin/env python3
"""
Test API endpoints to identify why ratings are not storing in database
"""

import requests
import json
import time

def test_api_endpoints():
    """Test all rating API endpoints"""
    base_url = "http://localhost:8081/api/recommendations"
    
    print("=== TESTING RATING API ENDPOINTS ===")
    
    # Test 1: Check if backend is running
    print("\n1. Testing backend connection...")
    try:
        response = requests.get(f"{base_url}/user/1/ratings", timeout=5)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Backend is running!")
        else:
            print("Backend not responding correctly")
    except requests.exceptions.RequestException as e:
        print(f"Backend connection failed: {e}")
        return
    
    # Test 2: Get user ratings (should be empty initially)
    print("\n2. Getting user 1 ratings...")
    try:
        response = requests.get(f"{base_url}/user/1/ratings")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            ratings = response.json()
            print(f"Current ratings for user 1: {len(ratings)} items")
        else:
            print("Failed to get user ratings")
    except Exception as e:
        print(f"Error getting user ratings: {e}")
    
    # Test 3: Submit a new rating
    print("\n3. Submitting new rating...")
    test_rating = {
        "userId": 1,
        "productId": 1,
        "rating": 5
    }
    
    try:
        response = requests.post(
            f"{base_url}/rate",
            json=test_rating,
            headers={'Content-Type': 'application/json'}
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("Rating submitted successfully!")
                print(f"Action: {result.get('action')}")
                print(f"User Rating: {result.get('userRating')}")
            else:
                print(f"Rating submission failed: {result.get('message')}")
        else:
            print("Rating submission failed")
    except Exception as e:
        print(f"Error submitting rating: {e}")
    
    # Test 4: Verify rating was saved
    print("\n4. Verifying rating was saved...")
    time.sleep(1)  # Wait for database to update
    
    try:
        response = requests.get(f"{base_url}/user/1/ratings")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            ratings = response.json()
            print(f"Ratings after submission: {len(ratings)} items")
            for rating in ratings:
                print(f"  - Product {rating.get('product', {}).get('id', 'N/A')}: Rating {rating.get('rating')}")
        else:
            print("Failed to verify saved rating")
    except Exception as e:
        print(f"Error verifying saved rating: {e}")
    
    # Test 5: Get product rating statistics
    print("\n5. Getting product 1 rating statistics...")
    try:
        response = requests.get(f"{base_url}/product/1/rating?userId=1")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            stats = response.json()
            print(f"Average Rating: {stats.get('averageRating')}")
            print(f"Rating Count: {stats.get('ratingCount')}")
            print(f"User Rating: {stats.get('userRating')}")
        else:
            print("Failed to get product statistics")
    except Exception as e:
        print(f"Error getting product statistics: {e}")
    
    # Test 6: Update existing rating
    print("\n6. Updating existing rating...")
    update_rating = {
        "userId": 1,
        "productId": 1,
        "rating": 3
    }
    
    try:
        response = requests.post(
            f"{base_url}/rate",
            json=update_rating,
            headers={'Content-Type': 'application/json'}
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("Rating updated successfully!")
                print(f"Action: {result.get('action')}")
                print(f"User Rating: {result.get('userRating')}")
            else:
                print(f"Rating update failed: {result.get('message')}")
        else:
            print("Rating update failed")
    except Exception as e:
        print(f"Error updating rating: {e}")
    
    # Test 7: Final verification
    print("\n7. Final verification...")
    try:
        response = requests.get(f"{base_url}/user/1/ratings")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            ratings = response.json()
            print(f"Final ratings count: {len(ratings)} items")
            for rating in ratings:
                product_id = rating.get('product', {}).get('id', 'N/A')
                rating_value = rating.get('rating')
                print(f"  - Product {product_id}: Rating {rating_value}")
        else:
            print("Failed final verification")
    except Exception as e:
        print(f"Error in final verification: {e}")

def test_database_direct():
    """Test database connection directly"""
    print("\n=== TESTING DATABASE CONNECTION ===")
    
    import subprocess
    
    try:
        # Test PostgreSQL connection
        result = subprocess.run([
            "psql", "-U", "postgres", "-d", "mealbasketsystem",
            "-c", "SELECT COUNT(*) FROM ratings;"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("Database connection successful!")
            print(f"Current ratings count: {result.stdout.strip()}")
            
            # Show all ratings
            result2 = subprocess.run([
                "psql", "-U", "postgres", "-d", "mealbasketsystem",
                "-c", "SELECT user_id, product_id, rating, created_at FROM ratings ORDER BY created_at DESC;"
            ], capture_output=True, text=True)
            
            if result2.returncode == 0:
                print("Current ratings in database:")
                print(result2.stdout)
            else:
                print("Failed to query ratings table")
        else:
            print("Database connection failed!")
            print(f"Error: {result.stderr}")
            
    except Exception as e:
        print(f"Database test error: {e}")

if __name__ == "__main__":
    print("Testing Rating API and Database...")
    test_api_endpoints()
    test_database_direct()
    print("\n=== TEST COMPLETE ===")
