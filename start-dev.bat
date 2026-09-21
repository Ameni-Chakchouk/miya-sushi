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

echo Make sure MySQL is started in XAMPP before continuing.
echo Starting Laravel and Vite...
start "Miya Sushi - Laravel" cmd /k "cd /d ""%~dp0"" && C:\xampp\php\php.exe artisan serve --host=127.0.0.1 --port=8000"
start "Miya Sushi - Vite" cmd /k "cd /d ""%~dp0"" && npm run dev"

timeout /t 3 /nobreak >nul
start "" http://127.0.0.1:8000
