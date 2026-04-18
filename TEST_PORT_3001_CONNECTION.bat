@echo off
echo === TESTING PORT 3001 CONNECTION TO BACKEND ===
echo.

echo Step 1: Check if Spring Boot is running on port 8081...
netstat -an | findstr :8081
if %errorlevel% equ 0 (
    echo Spring Boot: RUNNING on port 8081
) else (
    echo Spring Boot: NOT RUNNING on port 8081
    echo Starting Spring Boot...
    cd /d "c:\Users\User\Downloads\myMealbasket"
    start "Spring Boot Backend" cmd /k "mvn spring-boot:run"
    echo Waiting for Spring Boot to start...
    timeout /t 60 /nobreak >nul
)

echo.
echo Step 2: Test backend connection from port 3001...
echo Testing CORS and API connectivity...
curl -X GET http://localhost:8081/api/recommendations/user/1/ratings -H "Origin: http://localhost:3001" -w "HTTP Status: %%{http_code}\n"

echo.
echo Step 3: Test rating submission from port 3001...
curl -X POST http://localhost:8081/api/recommendations/rate -H "Content-Type: application/json" -H "Origin: http://localhost:3001" -d "{\"userId\": 1, \"productId\": 888, \"rating\": 4}" -w "HTTP Status: %%{http_code}\n"

echo.
echo Step 4: Verify database storage...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT 'Ratings in database: ' || COUNT(*) FROM ratings WHERE user_id = 1;" 2>nul

echo.
echo Step 5: Test specific product rating...
curl -X GET http://localhost:8081/api/recommendations/user/1/product/888/rating -H "Origin: http://localhost:3001" -w "HTTP Status: %%{http_code}\n"

echo.
echo === PORT 3001 CONNECTION TEST COMPLETE ===
echo.
echo CONFIGURATION:
echo - Frontend Port: 3001
echo - Backend Port: 8081
echo - CORS Config: Allows ports 3000 and 3001
echo - Database Port: 5433
echo.
echo EXPECTED RESULTS:
echo - API calls should work from port 3001
echo - CORS should allow connections from port 3001
echo - Ratings should store in database
echo.
echo NEXT STEPS:
echo 1. Open browser: http://localhost:3001
echo 2. Check browser console for API calls
echo 3. Test star rating functionality
echo 4. Verify database storage
echo.

pause
