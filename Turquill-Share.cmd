@echo off
rem Double-click to host a playtest: starts Turquill (Questbound-Share.cmd, its old name, runs this same file) and a secure internet link, then shows the link and invite code for your testers.
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch.ps1" -Share %*
echo.
pause
