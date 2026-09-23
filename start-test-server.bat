@echo off
setlocal
set PORT=8000
if not "%1"=="" (
  set PORT=%1
)

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  where python3 >nul 2>nul
  if %ERRORLEVEL% NEQ 0 (
    echo Python not found in PATH. Install Python 3 or add it to PATH.
    exit /b 1
  ) else (
    set PY=python3
  )
) else (
  set PY=python
)

echo Starting HTTP server on http://localhost:%PORT%
start "" %PY% -m http.server %PORT%
timeout /t 1 >nul
start "" "http://localhost:%PORT%"
endlocal
