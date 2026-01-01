@echo off
echo 🚀 Starting Café Management System...
echo.

REM Check if dist folder exists
if exist "dist\index.html" (
    echo 📱 Opening built application...
    start "" "dist\index.html"
) else (
    echo 🔨 Building application first...
    npm run build
    if exist "dist\index.html" (
        echo 📱 Opening built application...
        start "" "dist\index.html"
    ) else (
        echo ❌ Build failed. Please run: npm run build
        pause
        exit
    )
)

echo ✅ Application launched!
echo.
pause
