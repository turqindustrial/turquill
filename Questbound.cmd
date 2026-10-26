@echo off
rem Double-click to start Turquill (Turquill.cmd runs this same file): the Dungeon Master, shared table, desktop game and phone access.
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch.ps1" %*
echo.
pause
