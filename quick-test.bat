@echo off
echo Quick Backend Test
echo ==================
echo.

echo Testing compilation...
mvn clean compile -q
if %errorlevel% neq 0 (
    echo ❌ COMPILATION FAILED
    echo There are errors in the code that need to be fixed
    pause
    exit /b 1
)

echo ✅ Compilation successful
echo.

echo Starting backend for 10 seconds to test...
timeout /t 2 /nobreak >nul
echo Starting Spring Boot application...

start /B mvn spring-boot:run
timeout /t 10 /nobreak >nul

echo.
echo Testing if backend is responding...
curl -s http://localhost:8081/api/products >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is WORKING - responding on port 8081
) else (
    echo ❌ Backend not responding - may need more time to start
)

echo.
echo Test complete. Backend should be running now.
echo You can test endpoints at:
echo   http://localhost:8081/api/products
echo   http://localhost:8081/api/auth/login
pause
