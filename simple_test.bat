@echo off
echo === SIMPLE RATING SYSTEM TEST ===
echo.

echo 1. Checking Java...
java -version
echo.

echo 2. Checking Maven...
mvn -version
echo.

echo 3. Checking PostgreSQL...
pg_isready
echo.

echo 4. Checking if Spring Boot is running...
netstat -an | findstr :8081
echo.

echo 5. Testing database connection...
psql -U postgres -d mealbasketsystem -c "SELECT COUNT(*) FROM ratings;" 2>nul
echo.

echo 6. Starting Spring Boot...
echo Starting Spring Boot application...
cd /d "c:\Users\User\Downloads\myMealbasket"
mvn spring-boot:run

pause
