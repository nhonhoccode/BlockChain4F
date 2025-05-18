FROM python:3.11-slim\n\nWORKDIR /app\n\nCOPY requirements /app/requirements\nRUN pip install --no-cache-dir -r requirements/dev.txt\n\nCOPY . /app/\n\nCMD [\
