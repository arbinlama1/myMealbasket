#!/usr/bin/env python3
"""
Quick test to verify rating API is working and storing data in database
"""

import requests
import json
import subprocess

def test_rating_api():
    """Test the rating API with detailed logging"""
    base_url = "http://localhost:8081/api/recommendations"
    
    print("=== QUICK RATING API TEST ===")
    
    # Test 1: Check if backend is running
    print("\n1. Testing backend connection...")
    try:
        response = requests.get(f"{base_url}/user/1/ratings", timeout=5)
        print(f"Backend Status: {response.status_code}")
        if response.status_code == 200:
            print("Backend is running! Current ratings:", response.json())
        else:
            print("Backend connection issue")
            return False
    except Exception as e:
        print(f"Backend connection failed: {e}")
        return False
    
    # Test 2: Submit a rating
    print("\n2. Submitting test rating...")
    test_data = {
        "userId": 1,
        "productId": 999,
        "rating": 5
    }
    
    try:
        response = requests.post(
            f"{base_url}/rate",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        print(f"Submit Status: {response.status_code}")
        print(f"Submit Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("Rating submitted successfully!")
                print(f"Action: {result.get('action')}")
                return True
            else:
                print(f"Rating failed: {result.get('message')}")
                return False
        else:
            print("Rating submission failed")
            return False
    except Exception as e:
        print(f"Rating submission error: {e}")
        return False

def check_database_directly():
    """Check database directly for ratings"""
    print("\n=== DATABASE VERIFICATION ===")
    
    try:
        # Check if ratings table exists and count records
        result = subprocess.run([
            "psql", "-U", "postgres", "-d", "mealbasketsystem",
            "-c", "SELECT COUNT(*) as total_ratings FROM ratings;"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("Database connection successful!")
            print(f"Total ratings in database: {result.stdout.strip()}")
            
            # Show recent ratings
            result2 = subprocess.run([
                "psql", "-U", "postgres", "-d", "mealbasketsystem",
                "-c", "SELECT user_id, product_id, rating, created_at FROM ratings ORDER BY created_at DESC LIMIT 5;"
            ], capture_output=True, text=True)
            
            if result2.returncode == 0:
                print("Recent ratings:")
                print(result2.stdout)
            else:
                print("Could not query recent ratings")
        else:
            print("Database connection failed!")
            print(f"Error: {result.stderr}")
            
    except Exception as e:
        print(f"Database check error: {e}")

def main():
    print("Testing Rating System...")
    
    # Test API
    api_success = test_rating_api()
    
    # Check database
    check_database_directly()
    
    print("\n=== SUMMARY ===")
    if api_success:
        print("API Test: PASSED")
        print("Check Spring Boot logs for detailed rating operations")
        print("Check database for actual stored ratings")
    else:
        print("API Test: FAILED")
        print("Ensure Spring Boot is running on port 8081")
        print("Ensure PostgreSQL is accessible")

if __name__ == "__main__":
    main()
