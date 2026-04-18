@echo off
echo === API CONNECTIVITY TEST ===
echo.

echo Step 1: Check if backend is running...
curl -X GET http://localhost:8081/api/recommendations/health -w "Status: %%{http_code}\n" 2>nul
if %errorlevel% equ 0 (
    echo Backend: RUNNING and responding
) else (
    echo Backend: NOT RUNNING - Connection refused
    echo Please start Spring Boot first!
    pause
    exit /b 1
)

echo.
echo Step 2: Test GET user ratings...
curl -X GET http://localhost:8081/api/recommendations/user/1/ratings -w "Status: %%{http_code}\n" 2>nul

echo.
echo Step 3: Test GET specific product rating...
curl -X GET http://localhost:8081/api/recommendations/user/1/product/999/rating -w "Status: %%{http_code}\n" 2>nul

echo.
echo Step 4: Test POST rating submission...
echo Sending: {"userId": 1, "productId": 999, "rating": 4}
curl -X POST http://localhost:8081/api/recommendations/rate -H "Content-Type: application/json" -d "{\"userId\": 1, \"productId\": 999, \"rating\": 4}" -w "Status: %%{http_code}\n"

echo.
echo Step 5: Test CORS from port 3001...
curl -X GET http://localhost:8081/api/recommendations/user/1/ratings -H "Origin: http://localhost:3001" -w "Status: %%{http_code}\n" 2>nul

echo.
echo Step 6: Check database storage...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT COUNT(*) FROM ratings WHERE user_id = 1 AND product_id = 999;" 2>nul

echo.
echo Step 7: Show recent ratings...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT user_id, product_id, rating, created_at FROM ratings ORDER BY created_at DESC LIMIT 5;" 2>nul

echo.
echo Step 8: Test with different origins...
curl -X GET http://localhost:8081/api/recommendations/user/1/ratings -H "Origin: http://localhost:3000" -w "Status: %%{http_code}\n" 2>nul
curl -X GET http://localhost:8081/api/recommendations/user/1/ratings -H "Origin: http://localhost:3001" -w "Status: %%{http_code}\n" 2>nul

echo.
echo === API CONNECTIVITY TEST COMPLETE ===
echo.
echo SUMMARY:
echo 1. Backend should be RUNNING on port 8081
echo 2. All API endpoints should respond with 200
echo 3. CORS should allow port 3001
echo 4. Database should store ratings
echo.
echo EXPECTED RESULTS:
echo - Step 1: Status 200
echo - Step 2: Status 200
echo - Step 3: Status 200
echo - Step 4: Status 200
echo - Step 5: Status 200
echo - Step 6: Should show rating count
echo - Step 7: Should show recent ratings
echo - Step 8: Status 200 for both origins
echo.
echo NEXT STEPS:
echo 1. Open browser: http://localhost:3001
echo 2. Open Developer Tools (F12)
echo 3. Go to Console tab
echo 4. Try to rate a product
echo 5. Check Network tab for API calls
echo 6. Look for failed requests
echo 7. Check backend console output
echo.

pause
