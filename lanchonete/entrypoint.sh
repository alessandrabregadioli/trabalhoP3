#!/bin/sh

poetry run alembic upgrade head

poetry run uvicorn lanchonete.app:app --host 0.0.0.0 --port 8000