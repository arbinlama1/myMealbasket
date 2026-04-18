@echo off
echo === QUICK RATING STORAGE DIAGNOSIS ===
echo.

echo Step 1: Check Spring Boot...
curl -X GET http://localhost:8081/api/recommendations/user/1/ratings -w "Status: %%{http_code}\n" 2>nul
if %errorlevel% equ 0 (
    echo Spring Boot: RUNNING
) else (
    echo Spring Boot: NOT RUNNING
    pause
    exit /b 1
)

echo.
echo Step 2: Check database connection...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT 'Database: CONNECTED';" 2>nul
if %errorlevel% equ 0 (
    echo Database: CONNECTED
) else (
    echo Database: NOT CONNECTED
    pause
    exit /b 1
)

echo.
echo Step 3: Check ratings table...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT 'Ratings table: EXISTS';" 2>nul
if %errorlevel% equ 0 (
    echo Ratings table: EXISTS
) else (
    echo Ratings table: NOT FOUND
    echo Creating ratings table...
    psql -U postgres -d mealbasketsystem -p 5433 -c "CREATE TABLE IF NOT EXISTS ratings (id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL, product_id BIGINT NOT NULL, rating INTEGER NOT NULL CHECK (rating ^>= 0 AND rating ^<= 5), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, CONSTRAINT unique_user_product UNIQUE (user_id, product_id));" 2>nul
)

echo.
echo Step 4: Test rating submission...
curl -X POST http://localhost:8081/api/recommendations/rate -H "Content-Type: application/json" -d "{\"userId\": 1, \"productId\": 777, \"rating\": 4}" -w "Status: %%{http_code}\n"

echo.
echo Step 5: Check database storage...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT user_id, product_id, rating, created_at FROM ratings WHERE user_id = 1 AND product_id = 777;" 2>nul

echo.
echo Step 6: Test rating retrieval...
curl -X GET http://localhost:8081/api/recommendations/user/1/ratings -w "Status: %%{http_code}\n"

echo.
echo === DIAGNOSIS COMPLETE ===
echo.
echo If any step shows FAILED or ERROR, that's the issue!
echo Expected results:
echo - Step 1: Status 200
echo - Step 2: Database: CONNECTED
echo - Step 3: Ratings table: EXISTS
echo - Step 4: Status 200
echo - Step 5: Should show the rating
echo - Step 6: Status 200 with rating data
echo.

pause
