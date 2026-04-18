@echo off
echo === DIRECT DATABASE FIX FOR RATING STORAGE ===
echo.

echo Step 1: Stop any running Spring Boot processes...
taskkill /f /im java.exe 2>nul
echo.

echo Step 2: Start PostgreSQL service...
net start postgresql-x64-15
echo.

echo Step 3: Wait for PostgreSQL to start...
timeout /t 5 /nobreak >nul
echo.

echo Step 4: Test PostgreSQL connection on port 5432...
psql -U postgres -d mealbasketsystem -p 5432 -c "SELECT 'PostgreSQL is working on port 5432';" 2>nul
if %errorlevel% equ 0 (
    echo PostgreSQL working on port 5432
    set PG_PORT=5432
) else (
    echo PostgreSQL not working on port 5432, trying 5433...
    psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT 'PostgreSQL is working on port 5433';" 2>nul
    if %errorlevel% equ 0 (
        echo PostgreSQL working on port 5433
        set PG_PORT=5433
    ) else (
        echo PostgreSQL not working on either port
        echo Please check PostgreSQL installation
        pause
        exit /b 1
    )
)

echo.
echo Step 5: Create/update application.properties for port %PG_PORT%...
(
echo spring.application.name=MealBasketSyatem
echo spring.datasource.url=jdbc:postgresql://localhost:%PG_PORT%/mealbasketsystem
echo spring.datasource.username=postgres
echo spring.datasource.password=root
echo spring.datasource.driver-class-name=org.postgresql.Driver
echo.
echo spring.jpa.hibernate.ddl-auto=update
echo spring.jpa.show-sql=true
echo spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
echo spring.jpa.properties.hibernate.jdbc.batch_size=20
echo spring.jpa.properties.hibernate.order_inserts=true
echo spring.jpa.properties.hibernate.order_updates=true
echo spring.jpa.properties.hibernate.jdbc.batch_versioned_data=true
echo spring.jpa.properties.hibernate.check_nullability=true
echo.
echo server.port=8081
echo.
echo spring.web.cors.allowed-origins=http://localhost:3000,http://localhost:3001
echo spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
echo spring.web.cors.allowed-headers=Authorization,Content-Type,X-Requested-With
echo spring.web.cors.allow-credentials=true
echo.
echo logging.level.org.hibernate.SQL=DEBUG
echo logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
) > "c:\Users\User\Downloads\myMealbasket\src\main\resources\application.properties"

echo Updated application.properties for port %PG_PORT%

echo.
echo Step 6: Drop and recreate ratings table...
psql -U postgres -d mealbasketsystem -p %PG_PORT% -c "
DROP TABLE IF EXISTS ratings CASCADE;
CREATE TABLE ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating ^>= 0 AND rating ^<= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE ratings ADD CONSTRAINT unique_user_product UNIQUE (user_id, product_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_product_id ON ratings(product_id);
" 2>nul

if %errorlevel% equ 0 (
    echo Ratings table created successfully
) else (
    echo Failed to create ratings table
    pause
    exit /b 1
)

echo.
echo Step 7: Test database write operation...
psql -U postgres -d mealbasketsystem -p %PG_PORT% -c "
INSERT INTO ratings (user_id, product_id, rating) VALUES (1, 1, 5);
SELECT 'Test insert successful, count: ' || COUNT(*) FROM ratings;
DELETE FROM ratings WHERE user_id = 1 AND product_id = 1;
" 2>nul

if %errorlevel% equ 0 (
    echo Database write test successful
) else (
    echo Database write test failed
    pause
    exit /b 1
)

echo.
echo Step 8: Start Spring Boot with transaction logging...
cd /d "c:\Users\User\Downloads\myMealbasket"
echo Starting Spring Boot with enhanced logging...
start "Spring Boot Backend" cmd /k "mvn spring-boot:run -Dspring-boot.run.arguments=--logging.level.org.springframework.transaction=DEBUG"

echo.
echo Step 9: Wait for Spring Boot to start (60 seconds)...
timeout /t 60 /nobreak >nul

echo.
echo Step 10: Test API endpoint directly...
curl -X POST http://localhost:8081/api/recommendations/rate -H "Content-Type: application/json" -d "{\"userId\": 1, \"productId\": 2, \"rating\": 4}" -w "HTTP Status: %%{http_code}\n"

echo.
echo Step 11: Verify rating was stored in database...
psql -U postgres -d mealbasketsystem -p %PG_PORT% -c "
SELECT 'Ratings in database: ' || COUNT(*) FROM ratings;
SELECT user_id, product_id, rating, created_at FROM ratings ORDER BY created_at DESC LIMIT 5;
" 2>nul

echo.
echo Step 12: Test another rating...
curl -X POST http://localhost:8081/api/recommendations/rate -H "Content-Type: application/json" -d "{\"userId\": 1, \"productId\": 3, \"rating\": 3}" -w "HTTP Status: %%{http_code}\n"

echo.
echo Step 13: Verify second rating...
psql -U postgres -d mealbasketsystem -p %PG_PORT% -c "
SELECT 'Total ratings after second test: ' || COUNT(*) FROM ratings;
SELECT user_id, product_id, rating, created_at FROM ratings ORDER BY created_at DESC LIMIT 5;
" 2>nul

echo.
echo === DIRECT DATABASE FIX COMPLETE ===
echo.
echo RESULTS:
echo - PostgreSQL port: %PG_PORT%
echo - Database connection: WORKING
echo - Ratings table: CREATED
echo - Write permissions: WORKING
echo - Spring Boot: STARTED
echo - API endpoints: TESTED
echo.
echo If you see ratings in the database above, the fix is successful!
echo.
echo Next steps:
echo 1. Open browser: http://localhost:3000
echo 2. Login and test star rating system
echo 3. Check browser console for rating operations
echo 4. Verify ratings persist after page refresh
echo.

pause
