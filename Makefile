# Государственный архив ВКО. Запуск: make run. Список целей: make help.
PORT ?= 8000
HOST ?= 127.0.0.1
DB_PATH ?= backend/data/archive.db
OLLAMA_BASE_URL ?= http://127.0.0.1:11434
OLLAMA_MODEL ?= gemma4:26b
VENV := .venv
PY := $(VENV)/bin/python
STAMP := $(VENV)/.deps-installed

export DB_PATH

.DEFAULT_GOAL := help
.PHONY: help install seed run up demo dev test lint fmt check check-web backup \
	docker docker-build docker-up ollama clean

help: ## Список целей
	@echo "Использование: make <цель> [PORT=8000] [HOST=127.0.0.1]"
	@echo
	@grep -hE '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-12s %s\n", $$1, $$2}'

$(STAMP): requirements.txt requirements-dev.txt
	@if command -v uv >/dev/null 2>&1; then \
		[ -x $(PY) ] || uv venv -p 3.12 $(VENV); \
		uv pip install -r requirements-dev.txt; \
	else \
		[ -x $(PY) ] || python3 -m venv $(VENV); \
		$(PY) -m pip install -r requirements-dev.txt; \
	fi
	@touch $(STAMP)

install: $(STAMP) ## Создать .venv и поставить зависимости

seed: $(STAMP) ## Загрузить демо-данные в БД
	$(PY) -m backend.seed

$(DB_PATH): $(STAMP)
	$(PY) -m backend.seed

run: $(DB_PATH) ## С нуля: venv, зависимости, демо-БД (если нет), сервер на :PORT
	@echo "Сайт: http://$(HOST):$(PORT)   Swagger: http://$(HOST):$(PORT)/docs"
	API_DOCS=true $(VENV)/bin/uvicorn backend.app.main:app --host $(HOST) --port $(PORT)

up: run ## То же, что run

demo: $(STAMP) ## Пересоздать демо-БД и запустить сервер
	rm -f $(DB_PATH) $(DB_PATH)-wal $(DB_PATH)-shm
	$(MAKE) run

dev: $(DB_PATH) ## Сервер с автоперезагрузкой (разработка)
	API_DOCS=true $(VENV)/bin/uvicorn backend.app.main:app --reload --host $(HOST) --port $(PORT)

test: $(STAMP) ## Автотесты (pytest)
	$(VENV)/bin/pytest -q

lint: $(STAMP) ## ruff check + ruff format --check
	$(VENV)/bin/ruff check .
	$(VENV)/bin/ruff format --check .

fmt: $(STAMP) ## Автоисправление и форматирование ruff
	$(VENV)/bin/ruff check --fix .
	$(VENV)/bin/ruff format .

check-web: ## Ссылки в web/ и html-validate (нужен npx)
	python3 scripts/check_links.py web
	npx --yes html-validate@9 "web/**/*.html"

check: lint test check-web ## lint + test + check-web

backup: $(STAMP) ## Резервная копия БД (backend/data/backups/)
	$(PY) scripts/backup_db.py

docker: ## docker compose up --build (http://localhost:8000)
	docker compose up --build

docker-build: ## Собрать образ gosarhiv-vko
	docker build -t gosarhiv-vko .

docker-up: docker ## Синоним docker

ollama: $(DB_PATH) ## Сервер с локальной нейросетью (AI_PROVIDER=ollama)
	@curl -sf $(OLLAMA_BASE_URL)/api/tags >/dev/null \
		&& echo "Ollama доступен: $(OLLAMA_BASE_URL), модель $(OLLAMA_MODEL)" \
		|| { echo "Ollama не отвечает на $(OLLAMA_BASE_URL)."; \
		echo "  Установка: https://ollama.com ; затем: ollama pull $(OLLAMA_MODEL)"; \
		echo "  Без Ollama помощник отвечает локальным шаблоном."; }
	AI_PROVIDER=ollama OLLAMA_BASE_URL=$(OLLAMA_BASE_URL) OLLAMA_MODEL=$(OLLAMA_MODEL) API_DOCS=true \
		$(VENV)/bin/uvicorn backend.app.main:app --host $(HOST) --port $(PORT)

clean: ## Удалить кэши и демо-БД (.venv и файлы не трогает)
	rm -rf .pytest_cache .ruff_cache
	find . -name __pycache__ -not -path "./.venv/*" -not -path "./.git/*" -prune -exec rm -rf {} +
	rm -f $(DB_PATH) $(DB_PATH)-wal $(DB_PATH)-shm
