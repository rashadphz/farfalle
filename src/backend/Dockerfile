# Help from: https://github.com/cohere-ai/cohere-toolkit/blob/main/src/backend/Dockerfile

FROM python:3.11-slim as base

FROM base as build

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONIOENCODING=utf-8
ENV PYTHONPATH=/workspace/src/
ENV POETRY_VIRTUALENVS_IN_PROJECT=true

ENV VIRTUAL_ENV=/workspace/.venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

WORKDIR /workspace

COPY --chown=1000:1000 pyproject.toml poetry.lock ./

COPY --chown=1000:1000 . src/backend/

RUN pip install --no-cache-dir poetry

RUN poetry install --no-root

FROM base as final

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONIOENCODING=utf-8
ENV PYTHONPATH=/workspace/src/
ENV POETRY_VIRTUALENVS_IN_PROJECT=true

ENV VIRTUAL_ENV=/workspace/.venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY --from=build /workspace /workspace

RUN chown -R 1000:1000 /workspace

USER 1000:1000

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

HEALTHCHECK --interval=1m --timeout=3s CMD curl -f http://localhost:8000/chat || exit 1
