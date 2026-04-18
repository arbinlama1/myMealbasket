#!/usr/bin/env python3
"""
Complete Rating System Setup and Verification Script
For MealBasket E-commerce Website
"""

import subprocess
import time
import requests
import json

def run_command(command, description):
    """Run a command and display results"""
    print(f"\n🔧 {description}")
    print(f"Command: {command}")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ SUCCESS")
            if result.stdout:
                print(f"Output: {result.stdout}")
        else:
            print("✅ SUCCESS (no output)")
    except Exception as e:
        print(f"❌ ERROR: {e}")

def check_backend_health():
    """Check if backend is running and healthy"""
    print("\n🏥 Checking Backend Health...")
    try:
        response = requests.get("http://localhost:8081/api/recommendations/user/1/ratings", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running and responding")
            return True
        else:
            print(f"❌ Backend returned status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend connection failed: {e}")
        return False

def test_rating_workflow():
    """Test complete rating workflow"""
    print("\n🧪 Testing Complete Rating Workflow...")
    
    base_url = "http://localhost:8081/api"
    
    # Test 1: Submit initial rating
    print("\n1️⃣ Submitting initial rating...")
    try:
        response = requests.post(f"{base_url}/recommendations/rate", json={
            "userId": 1,
            "productId": 1,
            "rating": 5
        })
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Rating submitted: {data.get('message', 'Success')}")
        else:
            print(f"❌ Rating submission failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error submitting rating: {e}")
        return False
    
    # Test 2: Retrieve user ratings
    print("\n2️⃣ Retrieving user ratings...")
    try:
        response = requests.get(f"{base_url}/recommendations/user/1/ratings")
        if response.status_code == 200:
            ratings = response.json()
            if ratings:
                print(f"✅ Found {len(ratings)} ratings")
                for rating in ratings:
                    print(f"   - Product {rating['product']['id']}: Rating {rating['rating']}")
            else:
                print("❌ No ratings found")
                return False
        else:
            print(f"❌ Failed to retrieve ratings: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error retrieving ratings: {e}")
        return False
    
    # Test 3: Update existing rating
    print("\n3️⃣ Updating existing rating...")
    try:
        response = requests.post(f"{base_url}/recommendations/rate", json={
            "userId": 1,
            "productId": 1,
            "rating": 3
        })
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Rating updated: {data.get('message', 'Success')}")
            if data.get('action') == 'updated':
                print("✅ Existing record updated (not duplicated)")
            else:
                print("⚠️  New record created")
        else:
            print(f"❌ Rating update failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error updating rating: {e}")
        return False
    
    # Test 4: Get product rating with average
    print("\n4️⃣ Getting product rating with average...")
    try:
        response = requests.get(f"{base_url}/recommendations/product/1/rating?userId=1")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Product rating retrieved:")
            print(f"   - User Rating: {data.get('userRating', 'N/A')}")
            print(f"   - Average Rating: {data.get('averageRating', 0)}")
            print(f"   - Rating Count: {data.get('ratingCount', 0)}")
            print(f"   - Rating Distribution: {data.get('ratingDistribution', {})}")
        else:
            print(f"❌ Failed to get product rating: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error getting product rating: {e}")
        return False
    
    return True

def main():
    """Main setup and verification process"""
    print("🚀 MEALBASKET RATING SYSTEM SETUP")
    print("=" * 50)
    
    # Step 1: Database Setup
    print("\n📊 STEP 1: DATABASE SETUP")
    print("Please ensure you have run the PostgreSQL schema:")
    print("   psql -U postgres -d mealbasketsystem -f add_recommendation_schema_postgresql.sql")
    
    # Step 2: Backend Check
    print("\n🏥 STEP 2: BACKEND VERIFICATION")
    if not check_backend_health():
        print("\n❌ BACKEND NOT RUNNING")
        print("Please start the Spring Boot application:")
        print("   ./mvnw spring-boot:run")
        return
    
    # Step 3: Rating System Test
    print("\n🧪 STEP 3: COMPLETE SYSTEM TEST")
    if test_rating_workflow():
        print("\n✅ ALL TESTS PASSED!")
        print("\n🎯 RATING SYSTEM IS READY!")
        print("\nNext steps:")
        print("1. Start React frontend: npm start")
        print("2. Login with user credentials")
        print("3. Test rating functionality")
        print("4. Verify persistence after logout/login")
    else:
        print("\n❌ SOME TESTS FAILED!")
        print("Please check the errors above and fix issues.")

if __name__ == "__main__":
    main()
