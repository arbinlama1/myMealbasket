@echo off
echo === TESTING PERSISTENCE ISSUE ===
echo.

echo Step 1: Check if backend is running...
curl -X GET http://localhost:8081/api/ratings/health -w "Status: %%{http_code}\n" 2>nul
if %errorlevel% neq 0 (
    echo Backend: NOT RUNNING
    echo Please start Spring Boot first!
    pause
    exit /b 1
)

echo.
echo Step 2: Check ratings table...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT COUNT(*) FROM ratings;" 2>nul
if %errorlevel% neq 0 (
    echo Ratings table: NOT FOUND
    echo Creating ratings table...
    psql -U postgres -d mealbasketsystem -p 5433 -c "CREATE TABLE IF NOT EXISTS ratings (id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL, product_id BIGINT NOT NULL, rating INTEGER NOT NULL CHECK (rating ^>= 0 AND rating ^<= 5), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, CONSTRAINT unique_user_product UNIQUE (user_id, product_id));" 2>nul
)

echo.
echo Step 3: Test rating submission...
echo Sending: {"userId": 1, "productId": 444, "rating": 4}
curl -X POST http://localhost:8081/api/ratings/rate -H "Content-Type: application/json" -d "{\"userId\": 1, \"productId\": 444, \"rating\": 4}" -w "Status: %%{http_code}\n"

echo.
echo Step 4: IMMEDIATE database check...
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT user_id, product_id, rating, created_at FROM ratings WHERE user_id = 1 AND product_id = 444 ORDER BY created_at DESC LIMIT 1;" 2>nul

echo.
echo Step 5: Test rating retrieval...
curl -X GET http://localhost:8081/api/ratings/user/1/product/444 -w "Status: %%{http_code}\n" 2>nul

echo.
echo Step 6: Test all user ratings...
curl -X GET http://localhost:8081/api/ratings/user/1 -w "Status: %%{http_code}\n" 2>nul

echo.
echo Step 7: Check database count before and after...
echo Initial count:
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT COUNT(*) FROM ratings;" 2>nul

echo Submitting another rating...
curl -X POST http://localhost:8081/api/ratings/rate -H "Content-Type: application/json" -d "{\"userId\": 2, \"productId\": 555, \"rating\": 5}" -w "Status: %%{http_code}\n" 2>nul

echo Final count:
psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT COUNT(*) FROM ratings;" 2>nul

echo.
echo === PERSISTENCE TEST COMPLETE ===
echo.
echo EXPECTED RESULTS:
echo - Step 1: Status 200
echo - Step 2: Should show rating count
echo - Step 3: Status 200
echo - Step 4: Should show the stored rating
echo - Step 5: Status 200
echo - Step 6: Status 200
echo - Step 7: Final count should be higher than initial
echo.
echo IF STEP 4 SHOWS NO DATA OR STEP 7 COUNT DOESN'T INCREASE:
echo - Database transaction not working
echo - @Transactional annotation not effective
echo - Database connection issues
echo - Repository.save() not committing
echo.

pause
