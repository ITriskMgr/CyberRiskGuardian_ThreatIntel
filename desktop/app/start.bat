@echo off
REM CyberRiskGuardian Desktop - local launcher for Windows.
REM Serves this folder over http://localhost and opens it in your browser.
REM Serving is required: js/app.js is an ES module, and browsers refuse to
REM load modules from file:// URLs. No network connection is used or needed.
setlocal enabledelayedexpansion
cd /d "%~dp0"

set PORT=%1
if "%PORT%"=="" set PORT=8099
set "URL=http://localhost:%PORT%/"

where py >nul 2>&1 && set PY=py -3
if not defined PY where python >nul 2>&1 && set PY=python
if not defined PY (
  echo No local web server found.
  echo Install Python 3 from https://www.python.org/downloads/ and run this again.
  echo Tick "Add python.exe to PATH" in the installer.
  pause
  exit /b 1
)

REM Another copy of the app may already be serving this port - the same folder started twice, or an
REM earlier version in another folder. Until 1.9.1 the launcher stopped it silently; since 1.9.2 (item 3)
REM it asks first: y stops the running copy and starts this one; N (the default) leaves it running,
REM opens it in the browser and closes this window. A port used by a program that is not Python is
REM never touched: start with another port.
set "BUSYPID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /r /c:":%PORT% .*LISTENING"') do (
  if not defined BUSYPID set "BUSYPID=%%P"
)
if not defined BUSYPID goto :serve
tasklist /fi "PID eq %BUSYPID%" | findstr /i "python py.exe pythonw" >nul
if errorlevel 1 (
  echo Port %PORT% is used by another program ^(process %BUSYPID%^). Run: start.bat 8150
  pause
  exit /b 1
)
echo CyberRiskGuardian is already running on port %PORT% ^(Python process %BUSYPID%^).
echo   If it is this same folder, the running copy is the same version; otherwise probably an earlier one.
if "%CRG_LAUNCH_REPLACE%"=="1" goto :replace
if "%CRG_LAUNCH_KEEP%"=="1" goto :keep
set "ANS=N"
set /p ANS="Stop it and start this version instead? [y/N] "
if /i "!ANS!"=="y" goto :replace
if /i "!ANS!"=="yes" goto :replace
if /i "!ANS!"=="o" goto :replace
if /i "!ANS!"=="oui" goto :replace
:keep
echo Leaving it running. Opening %URL% in your browser; you can close this window.
start "" "%URL%"
exit /b 0
:replace
echo Stopping it so this version is the one you see.
taskkill /PID %BUSYPID% /F >nul
timeout /t 1 /nobreak >nul

:serve
echo CyberRiskGuardian Desktop
echo   serving %cd%
echo   at      %URL%
echo.
echo Leave this window open while you use the app and while downloads run.
echo Downloaded sources go to %USERPROFILE%\Downloads\CyberRiskGuardian-feeds. Press Ctrl-C to stop.
echo.
start "" "%URL%"
%PY% serve.py %PORT%
