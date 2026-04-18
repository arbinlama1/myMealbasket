@echo off
echo === TESTING API RESPONSE STRUCTURE ===
echo.

echo Step 1: Test backend API response structure...
curl -X GET http://localhost:8081/api/recommendations/user/1/ratings -H "Content-Type: application/json" -w "HTTP Status: %%{http_code}\n"

echo.
echo Step 2: Check what backend actually returns...
echo The backend returns: List[Rating] objects with nested User and Product entities
echo Structure: [{"id":1,"user":{"id":1,"name":"..."},"product":{"id":123,"name":"..."},"rating":5,"createdAt":"..."}]
echo.

echo Step 3: Check what frontend expects...
echo The frontend expects: Array of rating objects with product.id accessible
echo Expected processing: rating.product.id should work
echo.

echo Step 4: Test with actual database data...
psql -U postgres -d mealbasketsystem -p 5433 -c "
INSERT INTO ratings (user_id, product_id, rating, created_at) VALUES 
(1, 999, 5, CURRENT_TIMESTAMP);" 2>nul

echo.
echo Step 5: Test API call again...
curl -X GET http://localhost:8081/api/recommendations/user/1/ratings -H "Content-Type: application/json"

echo.
echo Step 6: Check frontend processing...
echo Issue: Frontend processes rating.product.id
echo If rating.product exists, should work correctly
echo If rating.product is null, productId will be undefined
echo.

echo === API RESPONSE ANALYSIS COMPLETE ===
echo.
echo LIKELY ISSUES:
echo 1. Frontend expects rating.product.id but gets null
echo 2. Backend sends full entity but frontend expects specific structure
echo 3. JSON serialization might be hiding product.id
echo.
echo SOLUTIONS:
echo 1. Check if rating.product is null in frontend
echo 2. Verify backend JSON response structure
echo 3. Add proper error handling for null products
echo.

pause
