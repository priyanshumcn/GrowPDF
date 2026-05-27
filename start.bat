@echo off
echo ====================================
echo   GrowPDF - Starting Application
echo ====================================
echo.

REM Kill any existing node processes on the ports
echo Stopping any existing servers...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
timeout /t 1 /nobreak >nul

REM Build the frontend (optional - skip if already built)
echo.
echo Building frontend...
call npx vite build
if %errorlevel% neq 0 (
    echo Warning: Build failed, continuing anyway...
)

REM Start the server (will serve both API and frontend)
echo.
echo Starting GrowPDF server...
echo.
echo   API:      http://localhost:5000/api
echo   Frontend: http://localhost:5000
echo.
echo   Demo Accounts:
echo   Reader:    reader@growpdf.com / read123
echo   Publisher: publisher@growpdf.com / pub123
echo   Admin:     admin@growpdf.com / admin123
echo.
echo ====================================
node server/index.js
pause
