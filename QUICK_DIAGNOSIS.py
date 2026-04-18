#!/usr/bin/env python3
import requests
import json

print("=== QUICK DIAGNOSIS ===")
print()

# Test 1: Check backend
print("1. Testing backend...")
try:
    response = requests.get("http://localhost:8081/api/ratings/health", timeout=5)
    if response.status_code == 200:
        print("   Backend: RUNNING")
    else:
        print(f"   Backend: Status {response.status_code}")
except Exception as e:
    print(f"   Backend: ERROR - {e}")

# Test 2: Test frontend connection
print("\n2. Testing frontend connection...")
try:
    response = requests.get("http://localhost:3001", timeout=5)
    if response.status_code == 200:
        print("   Frontend: RUNNING")
    else:
        print(f"   Frontend: Status {response.status_code}")
except Exception as e:
    print(f"   Frontend: ERROR - {e}")

# Test 3: Test rating API
print("\n3. Testing rating API...")
try:
    response = requests.get("http://localhost:8081/api/ratings/user/1", timeout=10)
    print(f"   Rating API: Status {response.status_code}")
except Exception as e:
    print(f"   Rating API: ERROR - {e}")

print("\n=== DIAGNOSIS COMPLETE ===")
print()
print("Based on results:")
print("- Backend RUNNING + Frontend RUNNING = Rating system ready")
print("- Backend ERROR = Start Spring Boot")
print("- Frontend ERROR = Start frontend server")
print("- Rating API ERROR = Check endpoints")
print()
print("COMMON FIXES:")
print("1. Clear browser cache")
print("2. Restart servers")
print("3. Check API endpoints")
print("4. Verify user authentication")
