@echo off
setlocal
cd /d "%~dp0"

echo Checking PostgreSQL...
set "POSTGRES_SERVICE="
for /f "tokens=1,*" %%A in ('sc query state^= all ^| findstr /R /C:"SERVICE_NAME: postgresql-x64-"') do if not defined POSTGRES_SERVICE set "POSTGRES_SERVICE=%%B"

if defined POSTGRES_SERVICE (
    sc query "%POSTGRES_SERVICE%" | findstr /C:"RUNNING" >nul
    if errorlevel 1 (
        echo Starting %POSTGRES_SERVICE%...
        net start "%POSTGRES_SERVICE%"
        if errorlevel 1 (
            echo Could not start PostgreSQL. Run this file as Administrator or start PostgreSQL manually.
            exit /b 1
        )
    ) else (
        echo PostgreSQL is already running.
    )
) else (
    echo No PostgreSQL Windows service was found.
    echo Start PostgreSQL manually, then run this file again.
    exit /b 1
)

echo.
set "PORT=5000"
set "VITE_API_URL=http://localhost:5000"

echo Starting backend and frontend...
npm run dev

endlocal
