@echo off
echo ========================================
echo CampusKart - Quick Start Script
echo ========================================
echo.

echo Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Docker found!
echo.

echo Checking docker-compose...
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: docker-compose is not installed
    pause
    exit /b 1
)

echo docker-compose found!
echo.

echo Starting CampusKart services...
echo This may take a few minutes on first run...
echo.

docker-compose up --build -d

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start services
    echo Check the error messages above
    pause
    exit /b 1
)

echo.
echo ========================================
echo Services started successfully!
echo ========================================
echo.
echo API Documentation: http://localhost:8000/docs
echo Health Check: http://localhost:8000/health
echo.
echo To view logs: docker-compose logs -f
echo To stop services: docker-compose down
echo.
echo ========================================
pause
