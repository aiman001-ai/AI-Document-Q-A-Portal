@echo off
echo ========================================================
echo Starting AI Document Q&A Portal Backend (Spring Boot)
echo ========================================================

cd /d "%~dp0backend"

where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java 17+ is not detected in your PATH.
    echo Please install OpenJDK 17 or 21, or run using Docker:
    echo docker compose up --build
    pause
    exit /b 1
)

echo Java detected. Starting application via Maven Wrapper...
call mvnw.cmd spring-boot:run
pause

