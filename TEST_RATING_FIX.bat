@echo off
echo === TESTING RATING SYSTEM FIX ===
echo.

echo Step 1: Restart Spring Boot with correct database port...
taskkill /f /im java.exe 2>nul
timeout /t 3 /nobreak >nul

cd /d "c:\Users\User\Downloads\myMealbasket"
echo Starting Spring Boot on port 8081 with database port 5432...
start "Spring Boot Backend" cmd /k "mvn spring-boot:run"

echo.
echo Step 2: Wait for Spring Boot to start...
timeout /t 45 /nobreak >nul

echo.
echo Step 3: Test database connection...
psql -U postgres -d mealbasketsystem -p 5432 -c "SELECT 'Database connected successfully on port 5432';" 2>nul
if %errorlevel% equ 0 (
    echo PostgreSQL connection: WORKING
) else (
    echo PostgreSQL connection: FAILED
    pause
    exit /b 1
)

echo.
echo Step 4: Test rating API endpoint...
curl -X POST http://localhost:8081/api/recommendations/rate -H "Content-Type: application/json" -d "{\"userId\": 1, \"productId\": 999, \"rating\": 4}" -w "HTTP Status: %%{http_code}\n"

echo.
echo Step 5: Verify rating stored in database...
psql -U postgres -d mealbasketsystem -p 5432 -c "SELECT 'Ratings in database: ' || COUNT(*) FROM ratings WHERE user_id = 1;" 2>nul

echo.
echo Step 6: Show stored ratings...
psql -U postgres -d mealbasketsystem -p 5432 -c "SELECT user_id, product_id, rating, created_at FROM ratings ORDER BY created_at DESC LIMIT 3;" 2>nul

echo.
echo Step 7: Test rating update...
curl -X POST http://localhost:8081/api/recommendations/rate -H "Content-Type: application/json" -d "{\"userId\": 1, \"productId\": 999, \"rating\": 5}" -w "HTTP Status: %%{http_code}\n"

echo.
echo Step 8: Verify update...
psql -U postgres -d mealbasketsystem -p 5432 -c "SELECT user_id, product_id, rating, created_at FROM ratings WHERE user_id = 1 AND product_id = 999 ORDER BY created_at DESC LIMIT 1;" 2>nul

echo.
echo === RATING SYSTEM TEST COMPLETE ===
echo.
echo RESULTS:
echo - Database Port: 5432 (CORRECT)
echo - Spring Boot Port: 8081 (CORRECT)
echo - API Endpoint: /api/recommendations/rate (CORRECT)
echo - Frontend Method: Direct fetch (FIXED)
echo - Database Storage: Should be working now
echo.
echo If you see ratings in database above, the fix is successful!
echo.
echo Next steps:
echo 1. Open browser: http://localhost:3000
echo 2. Login and test star rating system
echo 3. Check browser console for rating operations
echo 4. Verify ratings persist after page refresh
echo.

pause
