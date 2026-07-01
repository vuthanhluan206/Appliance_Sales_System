@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   DIEN LANH DONG TRIEU 24H - STARTUP & LOGGER SCRIPT
echo ========================================================

:: Create logs directory if not exists
if not exist logs (
    mkdir logs
    echo Created logs directory.
)

echo.
echo Starting Backend service (Spring Boot on port 8080)...
echo Logging terminal output to: logs\backend_terminal.log
start /b cmd /c "cd backend && mvnw spring-boot:run > ..\logs\backend_terminal.log 2>&1"

echo.
echo Starting Frontend service (Vite on port 5173)...
echo Logging terminal output to: logs\frontend_terminal.log
start /b cmd /c "cd frontend && npm run dev > ..\logs\frontend_terminal.log 2>&1"

echo.
echo ========================================================
echo Services are running in the background.
echo.
echo View live terminal logs:
echo   Backend:  type logs\backend_terminal.log
echo   Frontend: type logs\frontend_terminal.log
echo.
echo To stop services, close this terminal or end Java/Node processes.
echo ========================================================

pause
