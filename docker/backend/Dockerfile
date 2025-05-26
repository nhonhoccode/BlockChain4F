FROM python:3.11-slim

WORKDIR /app

COPY blockchain-administrative-management/backend/requirements /app/requirements
RUN pip install --no-cache-dir -r requirements/base.txt
RUN pip install --no-cache-dir google-auth==2.23.4

COPY blockchain-administrative-management/backend /app/

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
