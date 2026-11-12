FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1     PYTHONDONTWRITEBYTECODE=1     PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend backend
COPY web web
# исходные данные для наполнения БД(филиалы, личные фонды) - только эти два файла, не весь docs/
COPY docs/materials/filialy/filialy-2026.csv docs/materials/filialy/
COPY docs/research/current-site/content/personal_funds.json docs/research/current-site/content/

RUN useradd --create-home --uid 1000 appuser     && mkdir -p backend/data/files     && chown -R appuser:appuser backend/data
USER appuser

EXPOSE 8000

# БД живёт в томе backend/data: наполняется при первом старте, дальше правки из админки не затираются
CMD ["sh", "-c", "test -f backend/data/archive.db || python -m backend.seed; exec uvicorn backend.app.main:app --host 0.0.0.0 --port 8000"]
