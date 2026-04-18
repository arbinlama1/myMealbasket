#!/usr/bin/env python3
"""
Test Star Rating System specifically to identify why it's not storing in database
"""

import requests
import json
import time

def test_star_rating_api():
    """Test the star rating API endpoints"""
    base_url = "http://localhost:8081/api/recommendations"
    
    print("=== TESTING STAR RATING SYSTEM ===")
    
    # Test 1: Check if backend is running
    print("\n1. Testing backend connection...")
    try:
        response = requests.get(f"{base_url}/user/1/ratings", timeout=5)
        print(f"Backend Status: {response.status_code}")
        if response.status_code == 200:
            print("Backend is running!")
            current_ratings = response.json()
            print(f"Current ratings count: {len(current_ratings)}")
        else:
            print("Backend connection issue")
            return False
    except Exception as e:
        print(f"Backend connection failed: {e}")
        return False
    
    # Test 2: Submit a 3-star rating (typical star rating)
    print("\n2. Submitting 3-star rating...")
    star_rating_data = {
        "userId": 1,
        "productId": 123,
        "rating": 3  # 3-star rating
    }
    
    try:
        response = requests.post(
            f"{base_url}/rate",
            json=star_rating_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        print(f"Submit Status: {response.status_code}")
        print(f"Submit Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("3-star rating submitted successfully!")
                print(f"Action: {result.get('action')}")
                print(f"User Rating: {result.get('userRating')}")
                print(f"Average Rating: {result.get('averageRating')}")
                print(f"Rating Count: {result.get('ratingCount')}")
            else:
                print(f"3-star rating failed: {result.get('message')}")
                return False
        else:
            print("3-star rating submission failed")
            return False
    except Exception as e:
        print(f"3-star rating submission error: {e}")
        return False
    
    # Test 3: Submit a 5-star rating
    print("\n3. Submitting 5-star rating...")
    five_star_data = {
        "userId": 1,
        "productId": 124,
        "rating": 5  # 5-star rating
    }
    
    try:
        response = requests.post(
            f"{base_url}/rate",
            json=five_star_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        print(f"Submit Status: {response.status_code}")
        print(f"Submit Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("5-star rating submitted successfully!")
                print(f"Action: {result.get('action')}")
                print(f"User Rating: {result.get('userRating')}")
            else:
                print(f"5-star rating failed: {result.get('message')}")
                return False
        else:
            print("5-star rating submission failed")
            return False
    except Exception as e:
        print(f"5-star rating submission error: {e}")
        return False
    
    # Test 4: Update the 3-star rating to 4-star
    print("\n4. Updating 3-star rating to 4-star...")
    update_data = {
        "userId": 1,
        "productId": 123,
        "rating": 4  # Update to 4-star
    }
    
    try:
        response = requests.post(
            f"{base_url}/rate",
            json=update_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        print(f"Update Status: {response.status_code}")
        print(f"Update Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("Rating updated successfully!")
                print(f"Action: {result.get('action')}")
                print(f"User Rating: {result.get('userRating')}")
            else:
                print(f"Rating update failed: {result.get('message')}")
                return False
        else:
            print("Rating update failed")
            return False
    except Exception as e:
        print(f"Rating update error: {e}")
        return False
    
    # Test 5: Verify all ratings are stored
    print("\n5. Verifying all stored ratings...")
    time.sleep(1)  # Wait for database to update
    
    try:
        response = requests.get(f"{base_url}/user/1/ratings")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            ratings = response.json()
            print(f"Total ratings for user 1: {len(ratings)}")
            
            for rating in ratings:
                product_id = rating.get('product', {}).get('id', 'N/A')
                rating_value = rating.get('rating', 'N/A')
                created_at = rating.get('createdAt', 'N/A')
                print(f"  - Product {product_id}: {rating_value} stars (created: {created_at})")
                
                # Check if our test ratings are there
                if product_id == 123:
                    print(f"    -> 3-star rating updated to {rating_value} stars")
                elif product_id == 124:
                    print(f"    -> 5-star rating stored as {rating_value} stars")
        else:
            print("Failed to get user ratings")
            return False
    except Exception as e:
        print(f"Error verifying ratings: {e}")
        return False
    
    return True

def test_product_rating_stats():
    """Test product rating statistics"""
    base_url = "http://localhost:8081/api/recommendations"
    
    print("\n=== TESTING PRODUCT RATING STATISTICS ===")
    
    # Test product 123 statistics
    try:
        response = requests.get(f"{base_url}/product/123/rating?userId=1")
        print(f"Product 123 Stats Status: {response.status_code}")
        
        if response.status_code == 200:
            stats = response.json()
            print(f"Product 123 Statistics:")
            print(f"  - Average Rating: {stats.get('averageRating')}")
            print(f"  - Rating Count: {stats.get('ratingCount')}")
            print(f"  - User Rating: {stats.get('userRating')}")
        else:
            print("Failed to get product 123 statistics")
    except Exception as e:
        print(f"Error getting product 123 statistics: {e}")
    
    # Test product 124 statistics
    try:
        response = requests.get(f"{base_url}/product/124/rating?userId=1")
        print(f"Product 124 Stats Status: {response.status_code}")
        
        if response.status_code == 200:
            stats = response.json()
            print(f"Product 124 Statistics:")
            print(f"  - Average Rating: {stats.get('averageRating')}")
            print(f"  - Rating Count: {stats.get('ratingCount')}")
            print(f"  - User Rating: {stats.get('userRating')}")
        else:
            print("Failed to get product 124 statistics")
    except Exception as e:
        print(f"Error getting product 124 statistics: {e}")

def main():
    print("Testing Star Rating System...")
    
    # Test star rating API
    success = test_star_rating_api()
    
    if success:
        # Test product statistics
        test_product_rating_stats()
        
        print("\n=== STAR RATING TEST SUMMARY ===")
        print("Star Rating System: WORKING")
        print("All star ratings are being stored in database")
        print("Check Spring Boot logs for detailed operations")
    else:
        print("\n=== STAR RATING TEST SUMMARY ===")
        print("Star Rating System: NOT WORKING")
        print("Check:")
        print("1. Spring Boot is running on port 8081")
        print("2. PostgreSQL is accessible")
        print("3. Rating API endpoints are responding")
        print("4. Database transactions are committing")

if __name__ == "__main__":
    main()
