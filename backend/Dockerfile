# syntax=docker/dockerfile:1
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps for psycopg2 and build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# kod backenda u /app/backend
COPY backend /app/backend

# ako nema __init__.py, obavezno ga dodaj u folder backend/
ENV PYTHONPATH=/app
CMD ["uvicorn","backend.auth_api:app","--host","0.0.0.0","--port","8000"]
