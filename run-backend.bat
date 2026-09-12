@echo off
echo Starting StudyVault AI Backend on http://localhost:8000 ...
cd /d "%~dp0"
backend\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend
pause
