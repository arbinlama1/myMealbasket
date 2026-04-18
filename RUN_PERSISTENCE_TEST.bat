@echo off
echo === RUNNING PERSISTENCE TEST ===
echo.

echo Checking if Python is available...
python --version
if %errorlevel% neq 0 (
    echo Python not found. Please install Python.
    pause
    exit /b 1
)

echo.
echo Running persistence test...
python simple_test.py

echo.
echo === TEST COMPLETE ===
pause
