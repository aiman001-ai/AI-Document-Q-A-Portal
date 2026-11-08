@echo off
title Document Portal - Dev Server
echo ========================================================
echo   Starting Document Portal Services (Local Dev)
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Local API Server (Port 8080)...
start "Document Portal API (Port 8080)" cmd /k "node mock-backend/server.js"

echo [2/3] Starting Frontend Server (Port 4200)...
cd frontend
start "Document Portal Frontend (Port 4200)" cmd /k "node node_modules/@angular/cli/bin/ng.js serve --host 0.0.0.0 --port 4200"

echo [3/3] Launching browser at http://localhost:4200...
timeout /t 5 /nobreak >nul
start http://localhost:4200

echo.
echo ========================================================
echo   Services running:
echo   - Web UI: http://localhost:4200
echo   - API:    http://localhost:8080
echo.
echo   Default Credentials:
echo     Username: demo_user
echo     Password: password123
echo ========================================================
echo.
pause

