@echo off
echo === QUICK DIAGNOSIS ===
echo.

echo 1. Testing backend...
curl -X GET http://localhost:8081/api/ratings/health -w "Status: %%{http_code}\n" 2>nul
if %errorlevel% equ 0 (
    echo Backend: RUNNING
) else (
    echo Backend: NOT RUNNING
)

echo.
echo 2. Testing frontend...
curl -X GET http://localhost:3001 -w "Status: %%{http_code}\n" 2>nul
if %errorlevel% equ 0 (
    echo Frontend: RUNNING
) else (
    echo Frontend: NOT RUNNING
)

echo.
echo 3. Testing rating API...
curl -X GET http://localhost:8081/api/ratings/user/1 -w "Status: %%{http_code}\n" 2>nul
if %errorlevel% equ 0 (
    echo Rating API: WORKING
) else (
    echo Rating API: NOT WORKING
)

echo.
echo === DIAGNOSIS COMPLETE ===
echo.
echo COMMON FIXES:
echo 1. Clear browser cache (Ctrl+Shift+Delete)
echo 2. Restart frontend server
echo 3. Start Spring Boot (mvn spring-boot:run)
echo 4. Check user authentication
echo.
pause
