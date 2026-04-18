#!/usr/bin/env python3
import requests
import json
import time

print("=== BACKEND CONNECTION TEST ===")
print()

def test_backend_connection():
    print("1. Testing Backend Server Status...")
    try:
        response = requests.get("http://localhost:8081/actuator/health", timeout=5)
        if response.status_code == 200:
            print("   Backend Server: RUNNING")
            print(f"   Health Check: {response.json()}")
            return True
        else:
            print(f"   Backend Server: Status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("   Backend Server: NOT RUNNING - Connection refused")
        return False
    except Exception as e:
        print(f"   Backend Server: ERROR - {e}")
        return False

def test_rating_api():
    print("\n2. Testing Rating API Endpoint...")
    try:
        response = requests.get("http://localhost:8081/api/ratings/health", timeout=5)
        if response.status_code == 200:
            print("   Rating API: WORKING")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"   Rating API: Status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("   Rating API: NOT ACCESSIBLE - Connection refused")
        return False
    except Exception as e:
        print(f"   Rating API: ERROR - {e}")
        return False

def test_rating_submission():
    print("\n3. Testing Rating Submission...")
    try:
        test_data = {
            "userId": 1,
            "productId": 123,
            "rating": 4
        }
        
        response = requests.post(
            "http://localhost:8081/api/ratings/rate",
            headers={"Content-Type": "application/json"},
            json=test_data,
            timeout=10
        )
        
        print(f"   Rating Submission: Status {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Response: {result}")
            return True
        else:
            print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("   Rating Submission: FAILED - Connection refused")
        return False
    except Exception as e:
        print(f"   Rating Submission: ERROR - {e}")
        return False

def test_database_connection():
    print("\n4. Testing Database Connection...")
    try:
        response = requests.get("http://localhost:8081/api/ratings/test-db", timeout=5)
        if response.status_code == 200:
            print("   Database Connection: WORKING")
            return True
        else:
            print(f"   Database Connection: Status {response.status_code}")
            return False
    except:
        print("   Database Connection: UNKNOWN - No test endpoint")
        return None

def test_cors():
    print("\n5. Testing CORS Configuration...")
    try:
        response = requests.options(
            "http://localhost:8081/api/ratings/rate",
            headers={"Origin": "http://localhost:3001"},
            timeout=5
        )
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
        
        print(f"   CORS Headers: {cors_headers}")
        
        if 'http://localhost:3001' in str(cors_headers):
            print("   CORS: CONFIGURED for frontend")
            return True
        else:
            print("   CORS: NOT CONFIGURED for frontend")
            return False
            
    except Exception as e:
        print(f"   CORS Test: ERROR - {e}")
        return False

def main():
    print("Testing complete backend connectivity...")
    print()
    
    # Test all components
    backend_ok = test_backend_connection()
    api_ok = test_rating_api()
    submission_ok = test_rating_submission()
    db_ok = test_database_connection()
    cors_ok = test_cors()
    
    print("\n=== TEST RESULTS ===")
    print(f"Backend Server: {'OK' if backend_ok else 'FAILED'}")
    print(f"Rating API: {'OK' if api_ok else 'FAILED'}")
    print(f"Rating Submission: {'OK' if submission_ok else 'FAILED'}")
    print(f"Database Connection: {'OK' if db_ok else 'FAILED' if db_ok == False else 'UNKNOWN'}")
    print(f"CORS Configuration: {'OK' if cors_ok else 'FAILED'}")
    
    print("\n=== DIAGNOSIS ===")
    
    if not backend_ok:
        print("PROBLEM: Backend server is not running")
        print("SOLUTION: Start Spring Boot with 'mvn spring-boot:run'")
        
    elif not api_ok:
        print("PROBLEM: Rating API is not accessible")
        print("SOLUTION: Check if RatingController is loaded")
        
    elif not submission_ok:
        print("PROBLEM: Rating submission is failing")
        print("SOLUTION: Check API endpoint and request format")
        
    elif not cors_ok:
        print("PROBLEM: CORS is not configured")
        print("SOLUTION: Add frontend URL to CORS configuration")
        
    else:
        print("All backend components are working!")
        print("Frontend should be able to connect successfully")
    
    print("\n=== FRONTEND DEBUGGING ===")
    print("If backend is working but frontend still can't connect:")
    print("1. Check browser Network tab (F12 > Network)")
    print("2. Look for failed requests to http://localhost:8081")
    print("3. Check for CORS errors in console")
    print("4. Verify API URL in frontend code")
    print("5. Check if frontend is running on correct port (3001)")

if __name__ == "__main__":
    main()
