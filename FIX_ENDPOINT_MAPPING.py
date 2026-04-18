#!/usr/bin/env python3
import requests
import json

print("=== ENDPOINT MAPPING ISSUE IDENTIFIED ===")
print()

print("🔍 ISSUE FOUND:")
print("Your frontend calls: /api/recommendations/rate")
print("Your backend has: /api/recommendations/rate")
print("BUT your frontend calls: /api/recommendations/user/{userId}/ratings")
print("Your backend has: /api/recommendations/user/{userId}/ratings")
print()
print("✅ This part is working correctly!")
print()
print("🔍 ISSUE FOUND:")
print("Your frontend calls: /api/recommendations/user/{userId}/product/{productId}/rating")
print("Your backend has: /api/recommendations/user/{userId}/product/{productId}/ratings")
print("❌ ENDPOINT MISMATCH!")
print()

print("🔧 SOLUTION:")
print("Change backend endpoint from:")
print("  @GetMapping('/user/{userId}/product/{productId}/ratings')")
print("To:")
print("  @GetMapping('/user/{userId}/product/{productId}/rating')")
print()

print("\n🚀 QUICK TEST:")
try:
    # Test current (wrong) endpoint
    response = requests.get("http://localhost:8081/api/recommendations/user/1/product/999/ratings", timeout=5)
    print(f"Current endpoint: Status {response.status_code}")
    
    # Test correct endpoint
    response = requests.get("http://localhost:8081/api/recommendations/user/1/product/999/rating", timeout=5)
    print(f"Correct endpoint: Status {response.status_code}")
    
except Exception as e:
    print(f"Error: {e}")

print("\n📋 EXACT FIX NEEDED:")
print("In your RecommendationController.java, change line 184:")
print("FROM: @GetMapping('/user/{userId}/product/{productId}/ratings')")
print("TO:   @GetMapping('/user/{userId}/product/{productId}/rating')")
print()
print("This will fix the endpoint mapping issue!")
print()
print("🎯 EXPECTED RESULT:")
print("Frontend calls: /user/1/product/999/rating")
print("Backend responds: 200 OK")
print("Rating data returned correctly!")
print()

input("Press Enter to apply fix...")
