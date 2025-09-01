# Based on: https://github.com/cohere-ai/cohere-toolkit/blob/main/standalone.Dockerfile

FROM buildpack-deps:buster as builder
LABEL authors="rashadphz"


ENV PYTHON_VERSION=3.11.8
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONIOENCODING=utf-8
ENV LANG C.UTF-8
ENV PYTHONPATH=/workspace/src/

ENV VIRTUAL_ENV=/workspace/.venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

ENV POETRY_VIRTUALENVS_IN_PROJECT=true

RUN apt-get autoclean

# Install python
RUN cd /usr/src \
    && wget https://www.python.org/ftp/python/$PYTHON_VERSION/Python-$PYTHON_VERSION.tgz \
    && tar -xzf Python-$PYTHON_VERSION.tgz \
    && cd Python-$PYTHON_VERSION \
    && ./configure --enable-optimizations \
    && make install \
    && ldconfig \
    && rm -rf /usr/src/Python-$PYTHON_VERSION.tgz /usr/src/Python-$PYTHON_VERSION \
    && update-alternatives --install /usr/bin/python python /usr/local/bin/python3 1

# Install Poetry
RUN pip3 install --no-cache-dir poetry

WORKDIR /workspace

# Copy dependency files to avoid cache invalidations
COPY pyproject.toml poetry.lock ./

# Copy README.md for Poetry packaging
COPY README.md ./

# Install dependencies
RUN poetry install

# Copy the rest of the code
COPY src/backend src/backend


# Install nodejs
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm \
    # pm2 to start frontend
    && npm install -g pm2


WORKDIR /workspace/src/frontend
COPY src/frontend/package.json src/frontend/pnpm-lock.yaml ./

RUN pnpm install

COPY src/frontend/ .

RUN pnpm build

# SearxNG installation
WORKDIR /workspace/searxng

# Install searxng dependencies
RUN apt-get install -y \
    python3-dev python3-babel python3-venv \
    uwsgi uwsgi-plugin-python3 \
    git build-essential libxslt-dev zlib1g-dev libffi-dev libssl-dev

RUN git clone https://github.com/searxng/searxng.git .

RUN pip3 install -U pip setuptools wheel pyyaml

RUN pip3 install .

COPY /searxng/uwsgi.ini /workspace/searxng/uwsgi.ini
COPY /searxng/settings.yml /workspace/searxng/settings.yml
COPY /searxng/limiter.toml /workspace/searxng/limiter.toml

COPY /docker-scripts/entrypoint.sh /workspace/sbin/entrypoint.sh
COPY /docker-scripts/env-defaults /workspace/env-defaults
RUN chmod +x /workspace/sbin/entrypoint.sh

EXPOSE 8000
EXPOSE 3000
EXPOSE 8080

ENTRYPOINT ["/workspace/sbin/entrypoint.sh"]
