#!/usr/bin/env python3
import requests
import json
import subprocess
import sys

print("⚡ QUICK REALITY CHECK - RATING SYSTEM")
print()

print("👉 Favorites working = API correctly wired")
print("👉 Ratings empty = API never triggered OR wrong mapping")
print()

# QUICK TEST 1: Check if backend is receiving ANY rating requests
print("🔍 QUICK TEST 1: Check backend rating requests...")
try:
    # Test the exact endpoint that should be called
    response = requests.get("http://localhost:8081/api/recommendations/health", timeout=5)
    if response.status_code == 200:
        print("   Backend: ✅ RUNNING")
    else:
        print(f"   Backend: ❌ NOT RESPONDING (Status {response.status_code})")
        print("   → Start Spring Boot first!")
        sys.exit(1)
except:
    print("   Backend: ❌ NOT RUNNING")
    print("   → Start Spring Boot first!")
    sys.exit(1)

# QUICK TEST 2: Test the exact rating endpoint
print("\n🔍 QUICK TEST 2: Test rating endpoint...")
try:
    test_rating = {
        "userId": 1,
        "productId": 999,
        "rating": 4
    }
    
    response = requests.post(
        "http://localhost:8081/api/recommendations/rate",
        headers={"Content-Type": "application/json"},
        json=test_rating,
        timeout=10
    )
    
    print(f"   POST /rate: Status {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        if result.get('success', False):
            print("   Rating API: ✅ WORKING")
            print(f"   Action: {result.get('action', 'unknown')}")
        else:
            print(f"   Rating API: ❌ FAILED - {result.get('message', 'Unknown error')}")
    else:
        print(f"   Rating API: ❌ FAILED - Status {response.status_code}")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   Rating API: ❌ ERROR - {e}")

# QUICK TEST 3: Check database storage
print("\n🔍 QUICK TEST 3: Check database storage...")
try:
    result = subprocess.run(['psql', '-U', 'postgres', '-d', 'mealbasketsystem', '-p', '5433', 
                           '-c', 'SELECT COUNT(*) FROM ratings WHERE user_id = 1;'], 
                          capture_output=True, text=True, timeout=10)
    if result.returncode == 0:
        count = result.stdout.strip().split('\n')[1]
        print(f"   Database: ✅ {count} ratings found")
    else:
        print("   Database: ❌ CONNECTION ERROR")
except Exception as e:
    print(f"   Database: ❌ ERROR - {e}")

print("\n" + "="*50)
print("🎯 QUICK DIAGNOSIS:")
print()

# Check if issue is API never triggered
print("🔍 CHECK 1: Is API being called?")
print("   - Open browser: http://localhost:3001")
print("   - Open DevTools (F12)")
print("   - Go to Network tab")
print("   - Try to rate a product")
print("   - Look for POST /api/recommendations/rate")
print("   - If no POST request → API never triggered")

# Check if issue is wrong mapping
print("\n🔍 CHECK 2: Is API mapping correct?")
print("   - Frontend calls: http://localhost:8081/api/recommendations/rate")
print("   - Backend expects: POST /api/recommendations/rate")
print("   - If mismatch → Fix frontend URL or backend mapping")

# Check if issue is JSON fields
print("\n🔍 CHECK 3: Are JSON fields correct?")
print("   - Frontend sends: {userId, productId, rating}")
print("   - Backend expects: {userId, productId, rating}")
print("   - If mismatch → Check @RequestBody mapping")

print("\n" + "="*50)
print("🚀 FINAL FIX DIRECTION:")
print()
print("👉 IF YOU WANT FINAL FIX (FAST):")
print()
print("Send me:")
print("1. Your rating frontend code (star click part)")
print("2. Your RatingController.java")
print("3. I'll give you the EXACT fix needed")
print()
print("⚡ I'll analyze and provide the precise solution!")
print()

input("Press Enter to continue with testing...")
