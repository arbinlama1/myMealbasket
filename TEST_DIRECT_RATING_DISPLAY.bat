@echo off
echo === TESTING DIRECT RATING DISPLAY ===
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

echo.
echo Step 4: Create test ratings in database...
psql -U postgres -d mealbasketsystem -p 5433 -c "
INSERT INTO ratings (user_id, product_id, rating, created_at) VALUES 
(1, 100, 5, CURRENT_TIMESTAMP),
(1, 101, 3, CURRENT_TIMESTAMP),
(1, 102, 4, CURRENT_TIMESTAMP)
ON CONFLICT (user_id, product_id) DO UPDATE 
SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP;" 2>nul

echo.
echo Step 5: Verify test ratings created...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT 'Test ratings created: ' || COUNT(*) FROM ratings WHERE user_id = 1;" 2>nul

echo.
echo Step 6: Show test ratings...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT user_id, product_id, rating, created_at FROM ratings WHERE user_id = 1 ORDER BY product_id;" 2>nul

echo.
echo Step 7: Test API endpoints for direct rating display...
echo Testing product 100 rating (should show 5 stars):
curl -X GET http://localhost:8081/api/recommendations/user/1/product/100/rating -w "HTTP Status: %%{http_code}\n"

echo.
echo Testing product 101 rating (should show 3 stars):
curl -X GET http://localhost:8081/api/recommendations/user/1/product/101/rating -w "HTTP Status: %%{http_code}\n"

echo.
echo Testing product 102 rating (should show 4 stars):
curl -X GET http://localhost:8081/api/recommendations/user/1/product/102/rating -w "HTTP Status: %%{http_code}\n"

echo.
echo Step 8: Test all user ratings endpoint...
curl -X GET http://localhost:8081/api/recommendations/user/1/ratings -w "HTTP Status: %%{http_code}\n"

echo.
echo === DIRECT RATING DISPLAY TEST COMPLETE ===
echo.
echo EXPECTED RESULTS:
echo - Database: Port 5433 connected
echo - Test Ratings: Created in database
echo - API Endpoints: Responding with correct ratings
echo - Frontend: Should show ratings immediately on page load
echo.
echo NEXT STEPS:
echo 1. Open browser: http://localhost:3000
echo 2. Login with user ID 1
echo 3. Navigate to products with IDs 100, 101, 102
echo 4. EXPECT TO SEE: 5 stars, 3 stars, 4 stars respectively
echo 5. Check browser console for rating loading logs
echo.
echo If API calls above return 200 and ratings show in database,
echo then the star rating system should display ratings directly on page load!
echo.

pause
