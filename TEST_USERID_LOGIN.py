#!/usr/bin/env python3
import requests
import json

print("=== TEST USERID LOGIN ISSUE ===")
print()

print("PROBLEM IDENTIFIED:")
print("The console shows: 'Checking userId - current: null new: null'")
print("This happens because:")
print("1. User is not logged in")
print("2. localStorage has no userId")
print("3. useEffect is polling every second")
print()
print("SOLUTION:")
print("1. Login the user first")
print("2. Store userId in localStorage")
print("3. Verify userId is stored")
print()

# Test 1: Check if backend has login endpoint
print("1. Testing backend login endpoint...")
try:
    response = requests.get("http://localhost:8081/api/auth/health", timeout=5)
    if response.status_code == 200:
        print("   Backend auth: RUNNING")
    else:
        print(f"   Backend auth: Status {response.status_code}")
except Exception as e:
    print(f"   Backend auth: ERROR - {e}")
    print("   Please start Spring Boot with auth endpoints")

# Test 2: Simulate login
print("\n2. Simulating login...")
try:
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    response = requests.post(
        "http://localhost:8081/api/auth/login",
        headers={"Content-Type": "application/json"},
        json=login_data,
        timeout=10
    )
    
    print(f"   Login attempt: Status {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"   Login result: {result}")
        if result.get('token'):
            print("   Login: SUCCESS - Token received")
            print("   Frontend should store:")
            print(f"   - userId: {result.get('user', {}).get('id')}")
            print(f"   - token: {result.get('token')}")
            print(f"   - userName: {result.get('user', {}).get('name')}")
        else:
            print("   Login: FAILED - No token received")
    else:
        print(f"   Login: FAILED - {response.text}")
        
except Exception as e:
    print(f"   Login: ERROR - {e}")

# Test 3: Check what frontend should do
print("\n3. Frontend login implementation:")
print("   In your login component, store user data:")
print("""
   const handleLogin = (userData) => {
     // Store in localStorage
     localStorage.setItem('userId', userData.id.toString());
     localStorage.setItem('userName', userData.name);
     localStorage.setItem('userEmail', userData.email);
     localStorage.setItem('token', userData.token);
     
     console.log('User logged in - userId stored:', userData.id);
     console.log('LocalStorage contents:', {
       userId: localStorage.getItem('userId'),
       userName: localStorage.getItem('userName'),
       token: localStorage.getItem('token')
     });
   };
""")

print("\n4. Expected console output after login:")
print("""
   UserId changed from null to 1
   New userId detected, loading ratings...
   === LOADING USER RATINGS FROM DATABASE ===
   UserId from localStorage: 1
   UserId type: string
   UserId is null: false
   LocalStorage contents: {
     userId: "1",
     userName: "John Doe",
     token: "abc123..."
   }
""")

print("\n=== SOLUTION STEPS ===")
print("1. Implement proper login in your frontend")
print("2. Store userId in localStorage when user logs in")
print("3. Check browser console after login")
print("4. Verify userId is no longer null")
print("5. Test rating submission")
print("\nIf you don't have a login system yet:")
print("- Create a simple login form")
print("- Or use hardcoded userId for testing")
print("- Or implement Spring Security with JWT")
print("\nThe userId null error will disappear once user is properly logged in!")
