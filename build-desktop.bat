@echo off
echo 🚀 Building Café Management System Desktop App...
echo.

echo 📦 Production Mode: Building and creating distributable...
echo.

REM Build the web app and create desktop distributable
npm run electron:dist

echo.
echo ✅ Build completed! Check the dist-electron folder for the installer.
echo.

pause

