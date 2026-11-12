.PHONY: install seed dev test lint fmt check-web backup docker-build docker-up

install:
	@if command -v uv >/dev/null 2>&1; then 		uv venv -p 3.12 .venv && uv pip install -r requirements-dev.txt; 	else 		python3 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt; 	fi

seed:
	.venv/bin/python -m backend.seed

dev:
	.venv/bin/uvicorn backend.app.main:app --reload --port 8000

test:
	.venv/bin/pytest -q

lint:
	.venv/bin/ruff check .
	.venv/bin/ruff format --check .

fmt:
	.venv/bin/ruff check --fix .
	.venv/bin/ruff format .

check-web:
	python3 scripts/check_links.py web
	npx --yes html-validate@9 "web/**/*.html"

backup:
	python3 scripts/backup_db.py

docker-build:
	docker build -t gosarhiv-vko .

docker-up:
	docker compose up --build
