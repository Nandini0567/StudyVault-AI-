@echo off
title StudyVault AI Launcher
echo ========================================================
echo   Starting StudyVault AI Full-Stack Academic Vault...
echo ========================================================
cd /d "%~dp0"

echo [1/3] Starting FastAPI Backend on port 8000...
start "StudyVault AI - Backend Server (Port 8000)" cmd /k "backend\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend --reload"

echo [2/3] Starting Vite Frontend on port 5173...
timeout /t 2 /nobreak >nul
start "StudyVault AI - Frontend Client (Port 5173)" cmd /k "cd frontend && npm run dev"

echo [3/3] Opening browser at http://localhost:5173...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo ========================================================
echo   StudyVault AI is Running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo ========================================================
