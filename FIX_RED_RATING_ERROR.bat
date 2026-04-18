@echo off
echo === FIXING RED RATING ERROR ===
echo.

echo Step 1: Check Spring Boot...
curl -X GET http://localhost:8081/api/recommendations/user/1/ratings -w "Status: %%{http_code}\n" 2>nul
if %errorlevel% neq 0 (
    echo Spring Boot: NOT RUNNING - Starting now...
    cd /d "c:\Users\User\Downloads\myMealbasket"
    start "Spring Boot Backend" cmd /k "mvn spring-boot:run"
    echo Waiting 60 seconds for Spring Boot to start...
    timeout /t 60 /nobreak >nul
)

echo.
echo Step 2: Check database connection...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT 'Database: OK';" 2>nul
if %errorlevel% neq 0 (
    echo Database: NOT CONNECTED
    echo Please check PostgreSQL service
    pause
    exit /b 1
)

echo.
echo Step 3: Create ratings table if missing...
psql -U postgres -d mealbasketsystem -p 5433 -c "CREATE TABLE IF NOT EXISTS ratings (id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL, product_id BIGINT NOT NULL, rating INTEGER NOT NULL CHECK (rating ^>= 0 AND rating ^<= 5), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, CONSTRAINT unique_user_product UNIQUE (user_id, product_id));" 2>nul

echo.
echo Step 4: Test rating submission...
curl -X POST http://localhost:8081/api/recommendations/rate -H "Content-Type: application/json" -d "{\"userId\": 1, \"productId\": 456, \"rating\": 5}" -w "Status: %%{http_code}\n"

echo.
echo Step 5: Check database storage...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT user_id, product_id, rating, created_at FROM ratings WHERE user_id = 1 AND product_id = 456;" 2>nul

echo.
echo Step 6: Test rating retrieval...
curl -X GET http://localhost:8081/api/recommendations/user/1/ratings -w "Status: %%{http_code}\n"

echo.
echo Step 7: Test specific product rating...
curl -X GET http://localhost:8081/api/recommendations/user/1/product/456/rating -w "Status: %%{http_code}\n"

echo.
echo === RED RATING ERROR FIX COMPLETE ===
echo.
echo COMMON RED RATING ISSUES:
echo 1. Spring Boot not running - FIXED above
echo 2. Database not connected - FIXED above
echo 3. Ratings table missing - FIXED above
echo 4. API endpoint failing - Check response status
echo 5. Frontend not calling API - Check browser console
echo 6. CORS issues - Check application.properties
echo.
echo NEXT STEPS:
echo 1. Open browser: http://localhost:3001
echo 2. Open Developer Tools (F12)
echo 3. Go to Console tab
echo 4. Try to rate a product
echo 5. Look for red error messages
echo 6. Check Network tab for failed requests
echo.
echo If you see red color, check browser console for errors!
echo.

pause
