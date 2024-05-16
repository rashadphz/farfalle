# Farfalle

Open-source AI-powered search engine.

![Untitled (1200 x 630 px) (1)](https://github.com/rashadphz/farfalle/assets/20783686/ee589b9e-46b0-4a31-8e6a-9824993454dd)

## 💻 Live Demo

[farfalle.dev](https://farfalle.dev/)

## 📖 Overview

- 🛠️ [Tech Stack](#%EF%B8%8F-tech-stack)
- 🏃🏿‍♂️ [Getting Started](#%EF%B8%8F-getting-started)
- 🚀 [Deploy](#-deploy)

## 🛠️ Tech Stack

- Frontend: [Next.js](https://nextjs.org/)
- Backend: [FastAPI](fastapi.tiangolo.com/)
- Search API: [Tavily](https://tavily.com/)
- Logging: [Logfire](https://pydantic.dev/logfire)
- Rate Limiting: [Redis](https://redis.io/)
- Components: [shadcn/ui](https://ui.shadcn.com/)

## 🏃🏿‍♂️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/installation) or [npm](https://www.npmjs.com/get-npm)
- [Python](https://www.python.org/downloads/)
- [Poetry](https://python-poetry.org/docs/#installing-with-the-official-installer)

### Get API Keys

- [Tavily](https://app.tavily.com/home)
- [OpenAI](https://platform.openai.com/api-keys)
- [Groq](https://console.groq.com/keys)

### 1. Clone the Repo

```
git clone git@github.com:rashadphz/farfalle.git
```

### 2. Install Dependencies

#### Frontend

```
cd farfalle/src/frontend
pnpm install
```

#### Backend

```
cd farfalle/src/backend
poetry install
```

### 3. Secrets

Create a `.env` file in the root of the project and add these variables:

```
TAVILY_API_KEY=...
OPENAI_API_KEY=...
GROQ_API_KEY=...

# Everything below is optional

# Default (http://localhost:3000)
FRONTEND_URL=

# Logfire
LOGFIRE_TOKEN=

# (True | False)
RATE_LIMIT_ENABLED=

# Redis URL
REDIS_URL=
```

### 4. Run the App Locally

#### Frontend

```
cd farfalle/src/frontend
pnpm dev
```

#### Backend

```
cd farfalle/src/backend
poetry shell
uvicorn backend.main:app --reload
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

## 🚀 Deploy

### Backend
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/rashadphz/farfalle)

After the backend is deployed, copy the web service URL to your clipboard. 
It should look something like: https://some-service-name.onrender.com.

### Frontend
Use the copied backend URL in the `NEXT_PUBLIC_API_URL` environment variable when deploying with Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frashadphz%2Ffarfalle&env=NEXT_PUBLIC_API_URL&envDescription=URL%20for%20your%20backend%20application.%20For%20backends%20deployed%20with%20Render%2C%20the%20URL%20will%20look%20like%20this%3A%20https%3A%2F%2F%5Bsome-hostname%5D.onrender.com&root-directory=src%2Ffrontend)

And you're done! 🥳
