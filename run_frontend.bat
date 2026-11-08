@echo off
echo ========================================================
echo Starting AI Document Q&A Portal Frontend (Angular)
echo ========================================================

cd /d "%~dp0frontend"

if not exist "node_modules\" (
    echo [INFO] Installing frontend dependencies...
    call npm.cmd install --ignore-scripts
)

echo Starting Angular Dev Server at http://localhost:4200...
call npm.cmd start
pause
