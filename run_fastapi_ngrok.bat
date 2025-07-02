@echo off
echo Pokretanje FastAPI servera...
start cmd /k "uvicorn auth_api:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2

echo Pokretanje ngrok tunela...
start cmd /k "ngrok http 8000"

pause
