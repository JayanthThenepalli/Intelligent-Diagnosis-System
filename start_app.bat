@echo off
title Booting MediWise AI Diagnosis Console...
echo ============================================================
echo   MEDIWISE AI: INTELLIGENT DIAGNOSIS SYSTEM LAUNCHER
echo ============================================================
echo.

echo [1/3] Starting FastAPI Backend Server on Port 8001...
start "MediWise Backend Server" cmd /k "cd backend && python -m uvicorn main:app --port 8001"

echo.
echo [2/3] Starting React Frontend Server on Port 5173...
start "MediWise Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Waiting 5 seconds for models and servers to initialize...
timeout /t 5 /nobreak > nul

echo.
echo [3/3] Opening dashboard in your default browser...
start http://localhost:5173/

echo.
echo ============================================================
echo   MediWise AI is successfully running! 
echo   - Keep the two server terminal windows open while using.
echo   - To stop the system, simply close the server windows.
echo ============================================================
exit
