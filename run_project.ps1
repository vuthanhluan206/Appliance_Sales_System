# Create logs directory if not exists
if (-not (Test-Path -Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
    Write-Host "Created logs directory." -ForegroundColor Yellow
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   DIEN LANH DONG TRIEU 24H - STARTUP & LOGGER SCRIPT" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Start backend in a new window and save log
Write-Host "Starting Backend service (Spring Boot) in a new window..." -ForegroundColor Green
Write-Host "Logging to: logs\backend_terminal.log" -ForegroundColor Gray
Start-Process powershell -WorkingDirectory $PSScriptRoot -ArgumentList "-NoExit", "-Command", "cd backend; .\mvnw spring-boot:run 2>&1 | Tee-Object -FilePath '$PSScriptRoot\logs\backend_terminal.log'" -WindowStyle Normal

# Start frontend in a new window and save log
Write-Host "Starting Frontend service (Vite) in a new window..." -ForegroundColor Green
Write-Host "Logging to: logs\frontend_terminal.log" -ForegroundColor Gray
Start-Process powershell -WorkingDirectory $PSScriptRoot -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev 2>&1 | Tee-Object -FilePath '$PSScriptRoot\logs\frontend_terminal.log'" -WindowStyle Normal

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Both services have been launched in separate windows." -ForegroundColor Cyan
Write-Host "Their terminal activity is recorded automatically." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
