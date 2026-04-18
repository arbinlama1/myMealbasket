#!/usr/bin/env python3
import requests
import json
import time
import sys

print("=== RATING BACKEND CONNECTION TEST ===")
print()

# Configuration
BACKEND_URL = "http://localhost:8081"
API_BASE = f"{BACKEND_URL}/api/ratings"

def test_backend_connection():
    """Test if backend server is running"""
    print("1. TESTING BACKEND SERVER CONNECTION")
    print(f"URL: {BACKEND_URL}")
    
    try:
        response = requests.get(BACKEND_URL, timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is RUNNING")
            print(f"   Status Code: {response.status_code}")
            print(f"   Response: {response.text[:100]}...")
        else:
            print(f"❌ Backend server responded with: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend server is NOT RUNNING")
        print("   Start backend with: mvn spring-boot:run")
        return False
    except requests.exceptions.Timeout:
        print("❌ Backend server TIMEOUT")
        return False
    except Exception as e:
        print(f"❌ Backend connection error: {e}")
        return False
    
    print()
    return True

def test_rating_health_endpoint():
    """Test rating health endpoint"""
    print("2. TESTING RATING HEALTH ENDPOINT")
    print(f"URL: {API_BASE}/health")
    
    try:
        response = requests.get(f"{API_BASE}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Rating health endpoint is WORKING")
            print(f"   Status Code: {response.status_code}")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return False
    
    print()
    return True

def test_rating_endpoints():
    """Test all rating endpoints"""
    print("3. TESTING RATING ENDPOINTS")
    
    endpoints = [
        ("GET", "/api/ratings/user/1", "Get user ratings"),
        ("GET", "/api/ratings/user/1/product/123", "Get user product rating"),
        ("GET", "/api/ratings/product/123/stats", "Get product stats"),
        ("GET", "/api/ratings/top-rated", "Get top rated products")
    ]
    
    for method, endpoint, description in endpoints:
        url = f"{BACKEND_URL}{endpoint}"
        print(f"   Testing: {description}")
        print(f"   URL: {url}")
        
        try:
            if method == "GET":
                response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                print(f"   ✅ {description} - WORKING ({response.status_code})")
            elif response.status_code == 404:
                print(f"   ⚠️  {description} - NOT FOUND ({response.status_code})")
            elif response.status_code == 500:
                print(f"   ❌ {description} - SERVER ERROR ({response.status_code})")
            else:
                print(f"   ⚠️  {description} - {response.status_code}")
        except Exception as e:
            print(f"   ❌ {description} - ERROR: {e}")
        
        print()
    
    return True

def test_rating_submission():
    """Test rating submission endpoint"""
    print("4. TESTING RATING SUBMISSION")
    
    # Test data
    test_rating = {
        "productId": 123,
        "rating": 4
    }
    
    print(f"URL: {API_BASE}/rate")
    print(f"Method: POST")
    print(f"Data: {test_rating}")
    
    try:
        # Test without authentication first
        response = requests.post(
            f"{API_BASE}/rate",
            json=test_rating,
            timeout=5
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            print("✅ Authentication required (expected)")
            print("   This means the endpoint is working but needs JWT token")
        elif response.status_code == 200:
            print("✅ Rating submission working without auth")
        elif response.status_code == 400:
            print("⚠️  Bad request - check data format")
        elif response.status_code == 500:
            print("❌ Server error - check backend logs")
        else:
            print(f"⚠️  Unexpected response: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Rating submission error: {e}")
    
    print()

def test_cors():
    """Test CORS configuration"""
    print("5. TESTING CORS CONFIGURATION")
    
    headers = {
        "Origin": "http://localhost:3001",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type,Authorization"
    }
    
    try:
        response = requests.options(f"{API_BASE}/rate", headers=headers, timeout=5)
        
        print(f"OPTIONS Status Code: {response.status_code}")
        print(f"CORS Headers:")
        for header, value in response.headers.items():
            if 'cors' in header.lower() or 'access-control' in header.lower():
                print(f"   {header}: {value}")
        
        if 'Access-Control-Allow-Origin' in response.headers:
            print("✅ CORS is configured")
        else:
            print("❌ CORS is NOT configured")
            
    except Exception as e:
        print(f"❌ CORS test error: {e}")
    
    print()

def test_database_connection():
    """Test database connection through backend"""
    print("6. TESTING DATABASE CONNECTION")
    
    try:
        response = requests.get(f"{API_BASE}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if 'database' in data:
                print(f"✅ Database connection: {data['database']}")
            else:
                print("⚠️  Database status not in health response")
        else:
            print("❌ Cannot test database connection")
    except Exception as e:
        print(f"❌ Database connection test error: {e}")
    
    print()

def check_common_issues():
    """Check for common backend issues"""
    print("7. CHECKING COMMON ISSUES")
    
    print("Common issues and solutions:")
    print()
    
    print("❌ Backend not running:")
    print("   Solution: cd backend && mvn spring-boot:run")
    print()
    
    print("❌ Wrong port:")
    print("   Solution: Check application.properties for server.port=8081")
    print()
    
    print("❌ Database not connected:")
    print("   Solution: Check PostgreSQL is running on port 5433")
    print("   Solution: Verify database connection string")
    print()
    
    print("❌ CORS issues:")
    print("   Solution: Add cors configuration in application.properties")
    print("   spring.web.cors.allowed-origins=http://localhost:3000,http://localhost:3001")
    print()
    
    print("❌ Authentication issues:")
    print("   Solution: Check JWT token in localStorage")
    print("   Solution: Verify Spring Security configuration")
    print()
    
    print("❌ Rating entity issues:")
    print("   Solution: Check Rating.java entity mapping")
    print("   Solution: Verify RatingRepo methods")
    print("   Solution: Check RatingController endpoints")
    print()

def main():
    """Main test function"""
    print("Starting comprehensive rating backend connection test...")
    print("Time:", time.strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 60)
    print()
    
    # Run all tests
    backend_ok = test_backend_connection()
    if not backend_ok:
        print("❌ Backend server is not running. Fix this first!")
        check_common_issues()
        return
    
    test_rating_health_endpoint()
    test_rating_endpoints()
    test_rating_submission()
    test_cors()
    test_database_connection()
    check_common_issues()
    
    print("=" * 60)
    print("TEST SUMMARY")
    print()
    print("If all tests pass ✅, your rating backend is working correctly!")
    print("If tests fail ❌, check the specific error messages above.")
    print()
    print("Next steps:")
    print("1. Fix any backend issues found")
    print("2. Start frontend: npm start")
    print("3. Test rating system in browser")
    print("4. Check browser console for any errors")
    print()
    print("Frontend connection test:")
    print("- Open browser: http://localhost:3001")
    print("- Open DevTools: F12 > Network tab")
    print("- Click rating stars")
    print("- Look for requests to http://localhost:8081/api/ratings/rate")

if __name__ == "__main__":
    main()
