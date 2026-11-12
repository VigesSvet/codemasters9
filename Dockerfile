FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1     PYTHONDONTWRITEBYTECODE=1     PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend backend
COPY web web

RUN useradd --create-home --uid 1000 appuser     && mkdir -p backend/data/files     && chown -R appuser:appuser backend/data
USER appuser

RUN python -m backend.seed

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
