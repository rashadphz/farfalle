FROM python:3.11

WORKDIR /code

COPY pyproject.toml poetry.lock ./

RUN pip install --no-cache-dir && poetry install

