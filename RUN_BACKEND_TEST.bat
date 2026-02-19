@echo off
title MealBasket Backend Test
echo ========================================
echo Testing MealBasket System Backend
echo ========================================
echo.

echo Step 1: Starting Backend...
echo.
cd /d d:\MealBasketSyatem
start "Backend Server" mvn spring-boot:run

echo Waiting 20 seconds for backend to start...
timeout /t 20 /nobreak >nul

echo.
echo Step 2: Testing Database Connectivity...
echo Testing: http://localhost:8081/api/db-test/connectivity
powershell -Command "try { Invoke-RestMethod -Uri 'http://localhost:8081/api/db-test/connectivity' -Method GET | ConvertTo-Json } catch { Write-Host 'Database Connection: FAILED' }"

echo.
echo Step 3: Testing Health Check...
echo Testing: http://localhost:8081/api/test/health
powershell -Command "try { Invoke-RestMethod -Uri 'http://localhost:8081/api/test/health' -Method GET | ConvertTo-Json } catch { Write-Host 'Health Check: FAILED' }"

echo.
echo Step 4: Testing Authentication...
echo Testing: http://localhost:8081/api/auth/register
powershell -Command "$body = @{name='Test User'; email='test@example.com'; password='password123'} | ConvertTo-Json; try { Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/register' -Method POST -Body $body -ContentType 'application/json' | ConvertTo-Json; Write-Host 'Registration: SUCCESS' } catch { Write-Host 'Registration: FAILED' }"

echo.
echo Step 5: Testing Products API...
echo Testing: http://localhost:8081/api/products
powershell -Command "try { Invoke-RestMethod -Uri 'http://localhost:8081/api/products' -Method GET | ConvertTo-Json; Write-Host 'Products API: SUCCESS' } catch { Write-Host 'Products API: FAILED' }"

echo.
echo Step 6: Testing Smart Features...
echo Testing: http://localhost:8081/api/meal-plans/ai-recommendation
powershell -Command "try { Invoke-RestMethod -Uri 'http://localhost:8081/api/meal-plans/ai-recommendation?mealType=lunch&date=2026-02-14' -Method GET | ConvertTo-Json; Write-Host 'AI Features: SUCCESS' } catch { Write-Host 'AI Features: FAILED' }"

echo.
echo ========================================
echo BACKEND TEST COMPLETE
echo ========================================
echo.
echo Check the results above:
echo - All SUCCESS messages mean backend is working properly
echo - Any FAILED messages indicate issues that need to be resolved
echo.
echo Backend should be running on: http://localhost:8081
echo You can access the API endpoints directly in browser or with curl
echo.
pause
