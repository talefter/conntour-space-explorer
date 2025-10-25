@echo off
echo Testing Conntour Space Explorer Setup...
echo.

echo 1. Testing Backend Python Syntax...
cd backend
python -m py_compile app.py
if %errorlevel% neq 0 (
    echo Backend syntax check failed!
    exit /b 1
)
echo Backend syntax check passed!
echo.

echo 2. Testing Frontend TypeScript Compilation...
cd ..\frontend
call npm install --silent
if %errorlevel% neq 0 (
    echo Frontend npm install failed!
    exit /b 1
)

call npx tsc --noEmit
if %errorlevel% neq 0 (
    echo Frontend TypeScript check failed!
    exit /b 1
)
echo Frontend TypeScript check passed!
echo.

echo 3. All checks passed! Ready to run with Docker Compose.
echo Run: docker compose up --build
cd ..