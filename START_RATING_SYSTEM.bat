@echo off
echo === STARTING MEALBASKET RATING SYSTEM ===
echo.

echo Step 1: Starting PostgreSQL Service...
net start postgresql-x64-15 2>nul
echo.

echo Step 2: Checking Java Installation...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java and add to PATH
    pause
    exit /b 1
)
echo Java is installed
echo.

echo Step 3: Checking Maven Installation...
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Maven is not installed or not in PATH
    echo Please install Maven and add to PATH
    pause
    exit /b 1
)
echo Maven is installed
echo.

echo Step 4: Starting Spring Boot Backend...
echo This may take 2-3 minutes to start completely...
echo.

cd /d "c:\Users\User\Downloads\myMealbasket"
echo Running: mvn spring-boot:run
echo.

start "Spring Boot Backend" cmd /k "mvn spring-boot:run"

echo Waiting for Spring Boot to start...
timeout /t 60 /nobreak >nul

echo Step 5: Checking if Backend is Running...
netstat -an | findstr :8081 >nul
if %errorlevel% neq 0 (
    echo ERROR: Spring Boot failed to start on port 8081
    echo Please check the Spring Boot console for errors
    pause
    exit /b 1
)
echo Spring Boot is running on port 8081
echo.

echo Step 6: Testing Database Connection...
psql -U postgres -d mealbasketsystem -c "SELECT COUNT(*) FROM ratings;" >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Database connection may have issues
    echo But continuing with startup...
)

echo.
echo === RATING SYSTEM STARTUP COMPLETE ===
echo.
echo Backend API: http://localhost:8081/api/recommendations
echo Frontend:    http://localhost:3000
echo.
echo TESTING STAR RATING SYSTEM:
echo 1. Open browser and go to http://localhost:3000
echo 2. Login with valid credentials
echo 3. Navigate to any product detail page
echo 4. Click on the star rating (1-5 stars)
echo 5. Check browser console for rating operation logs
echo 6. Verify rating persists after page refresh
echo.
echo If star ratings still don't work:
echo 1. Check browser console for JavaScript errors
echo 2. Check Spring Boot console for database errors
echo 3. Verify PostgreSQL is running and accessible
echo.

pause
