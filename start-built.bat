@echo off
setlocal

cd /d "%~dp0"

echo [Miya Sushi] Checking local prerequisites...

if not exist "vendor\autoload.php" (
    echo Composer dependencies are missing. Run composer install first.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Node dependencies are missing. Run npm install first.
    pause
    exit /b 1
)

if exist "public\hot" (
    del /f /q "public\hot" >nul 2>&1
)

if not exist "public\build\manifest.json" (
    echo No production build found. Running npm run build...
    call npm run build
    if errorlevel 1 (
        echo Build failed.
        pause
        exit /b 1
    )
)

echo Make sure MySQL is started in XAMPP before continuing.
echo Starting Laravel on http://127.0.0.1:8000 ...
start "Miya Sushi - Laravel" cmd /k "cd /d ""%~dp0"" && C:\xampp\php\php.exe artisan serve --host=127.0.0.1 --port=8000"

timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:8000
