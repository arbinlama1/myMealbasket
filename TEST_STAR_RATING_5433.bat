@echo off
echo === TESTING STAR RATING WITH PORT 5433 ===
echo.

echo Step 1: Test PostgreSQL connection on port 5433...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT 'PostgreSQL working on port 5433';" 2>nul
if %errorlevel% equ 0 (
    echo PostgreSQL connection: WORKING on port 5433
) else (
    echo PostgreSQL connection: FAILED on port 5433
    echo Please check if PostgreSQL is running on port 5433
    pause
    exit /b 1
)

echo.
echo Step 2: Create ratings table if not exists...
psql -U postgres -d mealbasketsystem -p 5433 -c "
CREATE TABLE IF NOT EXISTS ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating ^>= 0 AND rating ^<= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);" 2>nul

if %errorlevel% equ 0 (
    echo Ratings table: READY
) else (
    echo Failed to create ratings table
    pause
    exit /b 1
)

echo.
echo Step 3: Start Spring Boot with port 5433...
taskkill /f /im java.exe 2>nul
timeout /t 3 /nobreak >nul

cd /d "c:\Users\User\Downloads\myMealbasket"
echo Starting Spring Boot with database port 5433...
start "Spring Boot Backend" cmd /k "mvn spring-boot:run"

echo.
echo Step 4: Wait for Spring Boot to start...
timeout /t 60 /nobreak >nul

echo.
echo Step 5: Test star rating API...
curl -X POST http://localhost:8081/api/recommendations/rate -H "Content-Type: application/json" -d "{\"userId\": 1, \"productId\": 123, \"rating\": 4}" -w "HTTP Status: %%{http_code}\n"

echo.
echo Step 6: Verify rating stored in database...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT 'Ratings in database: ' || COUNT(*) FROM ratings WHERE user_id = 1;" 2>nul

echo.
echo Step 7: Show stored ratings...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT user_id, product_id, rating, created_at FROM ratings ORDER BY created_at DESC LIMIT 3;" 2>nul

echo.
echo Step 8: Test rating update...
curl -X POST http://localhost:8081/api/recommendations/rate -H "Content-Type: application/json" -d "{\"userId\": 1, \"productId\": 123, \"rating\": 5}" -w "HTTP Status: %%{http_code}\n"

echo.
echo Step 9: Verify update...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT user_id, product_id, rating, created_at FROM ratings WHERE user_id = 1 AND product_id = 123 ORDER BY created_at DESC LIMIT 1;" 2>nul

echo.
echo === STAR RATING TEST COMPLETE ===
echo.
echo CONFIGURATION:
echo - Database Port: 5433 (YOUR PORT)
echo - Spring Boot Port: 8081
echo - API Endpoint: /api/recommendations/rate
echo - Frontend Method: Direct fetch
echo - Rating Storage: PostgreSQL
echo.
echo If you see ratings in database above, star rating system is working!
echo.
echo NEXT STEPS:
echo 1. Open browser: http://localhost:3000
echo 2. Login with valid credentials
echo 3. Go to any product detail page
echo 4. Click stars (1-5) to rate
echo 5. Check browser console for rating logs
echo 6. Refresh page - rating should persist
echo 7. Logout/login - same rating should reappear
echo.

pause
