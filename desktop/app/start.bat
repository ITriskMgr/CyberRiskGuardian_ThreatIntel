@echo off
REM CyberRiskGuardian Desktop - local launcher for Windows.
REM Serves this folder over http://localhost and opens it in your browser.
REM Serving is required: js/app.js is an ES module, and browsers refuse to
REM load modules from file:// URLs. No network connection is used or needed.
setlocal
cd /d "%~dp0"

set PORT=%1
if "%PORT%"=="" set PORT=8099

where py >nul 2>&1 && set PY=py -3
if not defined PY where python >nul 2>&1 && set PY=python
if not defined PY (
  echo No local web server found.
  echo Install Python 3 from https://www.python.org/downloads/ and run this again.
  echo Tick "Add python.exe to PATH" in the installer.
  pause
  exit /b 1
)

REM An earlier copy (for example version 1.0.0) may still be serving this port from another
REM folder; the browser would then keep showing the old version. Stop it if it is Python.
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /r /c:":%PORT% .*LISTENING"') do (
  tasklist /fi "PID eq %%P" | findstr /i "python py.exe" >nul && (
    echo Port %PORT% was in use by an earlier copy of the app ^(process %%P^). Stopping it.
    taskkill /PID %%P /F >nul
  ) || (
    echo Port %PORT% is used by another program ^(process %%P^). Run: start.bat 8150
    pause
    exit /b 1
  )
)

echo CyberRiskGuardian Desktop
echo   serving %cd%
echo   at      http://localhost:%PORT%/
echo.
echo Leave this window open while you use the app and while downloads run.
echo Downloaded sources go to %USERPROFILE%\Downloads\CyberRiskGuardian-feeds. Press Ctrl-C to stop.
echo.
start "" "http://localhost:%PORT%/"
%PY% serve.py %PORT%
