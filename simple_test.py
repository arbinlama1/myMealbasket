import requests
import json

print("=== TESTING PERSISTENCE ===")

try:
    # Test backend
    response = requests.get("http://localhost:8081/api/ratings/health", timeout=5)
    print(f"Backend Status: {response.status_code}")
    print(f"Backend Response: {response.text}")
    
    # Test rating submission
    test_data = {"userId": 1, "productId": 999, "rating": 4}
    response = requests.post("http://localhost:8081/api/ratings/rate", 
                           headers={"Content-Type": "application/json"}, 
                           json=test_data, timeout=10)
    print(f"Submit Status: {response.status_code}")
    print(f"Submit Response: {response.text}")
    
    # Test rating retrieval
    response = requests.get("http://localhost:8081/api/ratings/user/1/product/999", timeout=10)
    print(f"Retrieve Status: {response.status_code}")
    print(f"Retrieve Response: {response.text}")
    
except Exception as e:
    print(f"Error: {e}")

print("=== TEST COMPLETE ===")
