@echo off
echo Starting blockchain-administrative-management application...

REM Start the backend server in a new command prompt window
start cmd /k "cd backend && python manage.py runserver 0.0.0.0:8000"

REM Wait a moment for backend to initialize
timeout /t 5

REM Start the frontend development server in a new command prompt window
start cmd /k "cd frontend && npm start"

echo Both servers are starting. Please wait a moment...
echo Backend server is running at http://localhost:8000
echo Frontend server is running at http://localhost:3000 