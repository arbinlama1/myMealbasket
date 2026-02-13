@echo off
echo Testing All Backend Functions
echo ==============================
echo.

echo Starting backend first...
start /B mvn spring-boot:run
echo Waiting 15 seconds for backend to start...
timeout /t 15 /nobreak >nul

echo.
echo ========================================
echo 1. TESTING AUTHENTICATION FUNCTIONS
echo ========================================

echo.
echo a) User Registration:
curl -s -X POST http://localhost:8081/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
echo.

echo b) User Login:
curl -s -X POST http://localhost:8081/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
echo.

echo ========================================
echo 2. TESTING PRODUCT FUNCTIONS
echo ========================================

echo.
echo a) Get All Products:
curl -s http://localhost:8081/api/products
echo.

echo b) Create Product (should fail without auth):
curl -s -X POST http://localhost:8081/api/products ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Product\",\"price\":10.99,\"description\":\"Test Description\"}"
echo.

echo ========================================
echo 3. TESTING ORDER FUNCTIONS
echo ========================================

echo.
echo a) Get All Orders (should fail without auth):
curl -s http://localhost:8081/api/orders
echo.

echo ========================================
echo 4. TESTING CONTACT FUNCTIONS
echo ========================================

echo.
echo a) Send Contact Message:
curl -s -X POST http://localhost:8081/api/contact/message ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"content\":\"Test message\"}"
echo.

echo b) Get All Messages (should fail without auth):
curl -s http://localhost:8081/api/contact/messages
echo.

echo ========================================
echo 5. TESTING PUBLIC ENDPOINTS
echo ========================================

echo.
echo a) Health Check:
curl -s http://localhost:8081/api/test/health
echo.

echo b) Public Endpoint:
curl -s http://localhost:8081/api/test/public
echo.

echo ========================================
echo FUNCTION TEST COMPLETE
echo ========================================
echo.
echo Expected Results:
echo - Registration: Success (201)
echo - Login: Success with JWT token (200)
echo - Products GET: Success (200, may be empty array)
echo - Products POST: Forbidden (401) - needs auth
echo - Orders GET: Forbidden (401) - needs auth
echo - Contact POST: Success (201)
echo - Contact GET: Forbidden (401) - needs auth
echo - Health/Public: Success (200)
echo.
pause
