@echo off
echo === FIXING DATABASE STORAGE ISSUES ===
echo.

echo Step 1: Check PostgreSQL service status...
sc query postgresql-x64-15
echo.

echo Step 2: Check PostgreSQL port...
netstat -an | findstr :543
echo.

echo Step 3: Test database connection on port 5432...
psql -U postgres -d mealbasketsystem -p 5432 -c "SELECT version();" 2>nul
if %errorlevel% equ 0 (
    echo PostgreSQL working on port 5432
    echo.
    echo Step 4: Update application.properties for port 5432...
    echo spring.datasource.url=jdbc:postgresql://localhost:5432/mealbasketsystem > temp_props.txt
    echo spring.datasource.username=postgres >> temp_props.txt
    echo spring.datasource.password=root >> temp_props.txt
    echo spring.datasource.driver-class-name=org.postgresql.Driver >> temp_props.txt
    echo. >> temp_props.txt
    echo spring.jpa.hibernate.ddl-auto=update >> temp_props.txt
    echo spring.jpa.show-sql=true >> temp_props.txt
    echo spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect >> temp_props.txt
    echo. >> temp_props.txt
    echo server.port=8081 >> temp_props.txt
    echo. >> temp_props.txt
    echo spring.web.cors.allowed-origins=http://localhost:3000,http://localhost:3001 >> temp_props.txt
    echo spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS >> temp_props.txt
    echo spring.web.cors.allowed-headers=Authorization,Content-Type,X-Requested-With >> temp_props.txt
    echo spring.web.cors.allow-credentials=true >> temp_props.txt
    
    copy temp_props.txt "c:\Users\User\Downloads\myMealbasket\src\main\resources\application.properties" /Y
    del temp_props.txt
    echo Updated application.properties for port 5432
) else (
    echo PostgreSQL not working on port 5432
    echo.
    echo Step 4: Test database connection on port 5433...
    psql -U postgres -d mealbasketsystem -p 5433 -c "SELECT version();" 2>nul
    if %errorlevel% equ 0 (
        echo PostgreSQL working on port 5433
        echo application.properties already configured for port 5433
    ) else (
        echo PostgreSQL not working on either port
        echo Please check PostgreSQL installation and service
    )
)

echo.
echo Step 5: Create ratings table if not exists...
psql -U postgres -d mealbasketsystem -c "
CREATE TABLE IF NOT EXISTS ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 0 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);" 2>nul

if %errorlevel% equ 0 (
    echo Ratings table created/verified successfully
) else (
    echo Failed to create ratings table
)

echo.
echo Step 6: Test database write permissions...
psql -U postgres -d mealbasketsystem -c "
BEGIN;
INSERT INTO ratings (user_id, product_id, rating) VALUES (9999, 9999, 5) ON CONFLICT (user_id, product_id) DO UPDATE SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP;
SELECT COUNT(*) FROM ratings WHERE user_id = 9999;
DELETE FROM ratings WHERE user_id = 9999;
ROLLBACK;
" 2>nul

if %errorlevel% equ 0 (
    echo Database write permissions: OK
) else (
    echo Database write permissions: FAILED
)

echo.
echo Step 7: Start Spring Boot with correct database settings...
cd /d "c:\Users\User\Downloads\myMealbasket"
echo Starting Spring Boot...
start "Spring Boot Backend" cmd /k "mvn spring-boot:run"

echo.
echo Waiting for Spring Boot to start...
timeout /t 30 /nobreak >nul

echo.
echo Step 8: Test rating API...
curl -X POST http://localhost:8081/api/recommendations/rate -H "Content-Type: application/json" -d "{\"userId\": 1, \"productId\": 7777, \"rating\": 4}" 2>nul

echo.
echo Step 9: Check if rating was stored...
psql -U postgres -d mealbasketsystem -c "SELECT COUNT(*) FROM ratings WHERE product_id = 7777;" 2>nul

echo.
echo === DATABASE FIX COMPLETE ===
echo.
echo If ratings still don't store:
echo 1. Check Spring Boot console for database connection errors
echo 2. Verify PostgreSQL service is running
echo 3. Check database credentials in application.properties
echo 4. Test with browser console for JavaScript errors
echo.

pause
