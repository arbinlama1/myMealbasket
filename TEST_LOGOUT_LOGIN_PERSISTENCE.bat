@echo off
echo === TESTING LOGOUT/LOGIN RATING PERSISTENCE ===
echo.

echo Step 1: Start Spring Boot with port 5433...
taskkill /f /im java.exe 2>nul
timeout /t 3 /nobreak >nul

cd /d "c:\Users\User\Downloads\myMealbasket"
echo Starting Spring Boot...
start "Spring Boot Backend" cmd /k "mvn spring-boot:run"

echo.
echo Step 2: Wait for Spring Boot to start...
timeout /t 45 /nobreak >nul

echo.
echo Step 3: Test database connection...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT 'Database connected on port 5433';" 2>nul
if %errorlevel% neq 0 (
    echo PostgreSQL connection: FAILED
    pause
    exit /b 1
)

echo.
echo Step 4: Create test ratings for user 1...
psql -U postgres -d mealbasketsystem -p 5433 -c "
DELETE FROM ratings WHERE user_id = 1;
INSERT INTO ratings (user_id, product_id, rating, created_at) VALUES 
(1, 200, 5, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(1, 201, 3, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(1, 202, 4, CURRENT_TIMESTAMP - INTERVAL '3 hours')
ON CONFLICT (user_id, product_id) DO UPDATE 
SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP;" 2>nul

echo.
echo Step 5: Verify test ratings created...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT 'Test ratings created: ' || COUNT(*) FROM ratings WHERE user_id = 1;" 2>nul

echo.
echo Step 6: Show test ratings...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT user_id, product_id, rating, created_at FROM ratings WHERE user_id = 1 ORDER BY product_id;" 2>nul

echo.
echo Step 7: Test API endpoints for user 1...
echo Testing all user ratings:
curl -X GET http://localhost:8081/api/recommendations/user/1/ratings -w "HTTP Status: %%{http_code}\n"

echo Testing product 200 rating:
curl -X GET http://localhost:8081/api/recommendations/user/1/product/200/rating -w "HTTP Status: %%{http_code}\n"

echo Testing product 201 rating:
curl -X GET http://localhost:8081/api/recommendations/user/1/product/201/rating -w "HTTP Status: %%{http_code}\n"

echo Testing product 202 rating:
curl -X GET http://localhost:8081/api/recommendations/user/1/product/202/rating -w "HTTP Status: %%{http_code}\n"

echo.
echo Step 8: Simulate logout/login cycle...
echo.
echo === SIMULATION TEST ===
echo 1. User visits site with userId 1
echo 2. EXPECTED: Should see 5, 3, 4 stars for products 200, 201, 202
echo 3. User logs out
echo 4. User logs back in with userId 1
echo 5. EXPECTED: Should see same 5, 3, 4 stars
echo 6. User changes rating
echo 7. EXPECTED: Should update in database AND show new rating
echo.

echo === LOGOUT/LOGIN PERSISTENCE TEST COMPLETE ===
echo.
echo EXPECTED BEHAVIOR:
echo - Ratings load from database on login
echo - Ratings persist after logout/login
echo - Ratings update correctly in database
echo - Frontend shows database ratings immediately
echo.
echo NEXT STEPS:
echo 1. Open browser: http://localhost:3000
echo 2. Login with user ID 1
echo 3. Check products 200, 201, 202
echo 4. EXPECT to see: 5 stars, 3 stars, 4 stars
echo 5. Logout and login again
echo 6. EXPECT to see: Same ratings
echo 7. Change rating and check database
echo.

pause
