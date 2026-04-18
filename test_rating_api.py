#!/usr/bin/env python3
"""
Test Rating API Connectivity
"""

import requests
import json
import time

def test_api_endpoints():
    """Test all rating API endpoints"""
    base_url = "http://localhost:8081/api/ratings"
    
    print("=== TESTING RATING API ENDPOINTS ===")
    print(f"Base URL: {base_url}")
    print()
    
    # Test 1: Health Check
    print("1. Testing Health Check Endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check: {data}")
        else:
            print(f"❌ Health Check Failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Health Check Error: {e}")
    print()
    
    # Test 2: Test Endpoint
    print("2. Testing Test Endpoint...")
    try:
        response = requests.get(f"{base_url}/test", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Test Endpoint: {data}")
        else:
            print(f"❌ Test Endpoint Failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Test Endpoint Error: {e}")
    print()
    
    # Test 3: Get Ratings (without auth)
    print("3. Testing Get Ratings (without auth)...")
    try:
        response = requests.get(f"{base_url}", timeout=5)
        if response.status_code == 401:
            print("✅ Get Ratings: Correctly requires authentication (401)")
        elif response.status_code == 200:
            print("⚠️ Get Ratings: Unexpectedly works without auth")
        else:
            print(f"❌ Get Ratings: Unexpected status {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Get Ratings Error: {e}")
    print()
    
    # Test 4: Submit Rating (without auth)
    print("4. Testing Submit Rating (without auth)...")
    try:
        rating_data = {
            "productId": 123,
            "rating": 4
        }
        response = requests.post(
            f"{base_url}/rate",
            json=rating_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        if response.status_code == 401:
            print("✅ Submit Rating: Correctly requires authentication (401)")
        elif response.status_code == 200:
            print("⚠️ Submit Rating: Unexpectedly works without auth")
        else:
            print(f"❌ Submit Rating: Unexpected status {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Submit Rating Error: {e}")
    print()
    
    # Test 5: Check Backend Server
    print("5. Testing Backend Server Connection...")
    try:
        response = requests.get("http://localhost:8081/actuator/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend Server: Running and healthy")
        else:
            print(f"⚠️ Backend Server: Status {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend Server: Not responding - {e}")
    print()

def test_frontend_connection():
    """Test if frontend can connect to backend"""
    print("=== TESTING FRONTEND-BACKEND CONNECTION ===")
    
    # Simulate frontend request
    try:
        response = requests.get(
            "http://localhost:8081/api/ratings/health",
            headers={
                "Origin": "http://localhost:3001",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Content-Type, Authorization"
            },
            timeout=5
        )
        
        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
            "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers")
        }
        
        print(f"✅ Frontend Connection: Status {response.status_code}")
        print(f"✅ CORS Headers: {cors_headers}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Frontend Connection Error: {e}")
    print()

def main():
    """Main test function"""
    print("🌟 RATING API CONNECTIVITY TEST 🌟")
    print("=" * 50)
    
    # Wait a moment for backend to start
    print("Waiting for backend to start...")
    time.sleep(2)
    
    # Run tests
    test_api_endpoints()
    test_frontend_connection()
    
    print("=" * 50)
    print("🎯 TEST COMPLETE")
    print()
    print("If tests pass, the rating API should work!")
    print("If tests fail, check:")
    print("1. Backend is running on port 8081")
    print("2. No port conflicts")
    print("3. Database is connected")
    print("4. CORS is configured")

if __name__ == "__main__":
    main()
