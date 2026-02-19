@echo off
title MealBasket Frontend
echo ========================================
echo Starting MealBasket React Frontend
echo ========================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found.
echo.

echo Checking if npm is installed...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed
    echo Please install npm along with Node.js
    pause
    exit /b 1
)

echo npm found.
echo.

echo Installing dependencies...
cd /d d:\MealBasketSyatem\react-frontend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo Dependencies installed successfully.
echo.

echo Starting React development server...
echo Frontend will be available at: http://localhost:3000
echo.
echo Make sure backend is running on: http://localhost:8081
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
