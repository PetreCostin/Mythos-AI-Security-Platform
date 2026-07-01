install:
	pip install -r requirements.txt

test:
	python -m pytest --cov=mythos --cov-report=term-missing

run:
	uvicorn mythos.api.main:app --reload --host 0.0.0.0 --port 8000

lint:
	ruff check . && black --check . && mypy mythos

migrate:
	alembic upgrade head
