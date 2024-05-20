# Farfalle

Open-source AI-powered search engine. 

Run your local LLM (**llama3**, **gemma**, **mistral**) or use  cloud models (**Groq/Llama3**, **OpenAI/gpt4-o**)

Demo answering questions with llama3 on my M1 Macbook Pro:

https://github.com/rashadphz/farfalle/assets/20783686/790a47c3-b978-4134-aabc-6fc1be5b8dae


## 💻 Live Demo

[farfalle.dev](https://farfalle.dev/) (Cloud models only)

## 📖 Overview

- 🛠️ [Tech Stack](#%EF%B8%8F-tech-stack)
- 🏃🏿‍♂️ [Getting Started](#%EF%B8%8F-getting-started)
- 🚀 [Deploy](#-deploy)

## 🛣️ Roadmap

- [x] Add support for local LLMs through Ollama
- [x] Docker deployment setup
- [ ] Integrate with LiteLLM
- [ ] Add support for [searxng](https://github.com/searxng/searxng). Eliminates the need for external dependencies.

## 🛠️ Tech Stack

- Frontend: [Next.js](https://nextjs.org/)
- Backend: [FastAPI](https://fastapi.tiangolo.com/)
- Search API: [Tavily](https://tavily.com/)
- Logging: [Logfire](https://pydantic.dev/logfire)
- Rate Limiting: [Redis](https://redis.io/)
- Components: [shadcn/ui](https://ui.shadcn.com/)

## 🏃🏿‍♂️ Getting Started Locally

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Ollama](https://ollama.com/download) (If running local models)
  - Download any of the supported models: **llama3**, **mistral**, **gemma**
  - Start ollama server `ollama serve`

### Get API Keys

- [Tavily](https://app.tavily.com/home)
- [OpenAI (Optional)](https://platform.openai.com/api-keys)
- [Groq (Optional)](https://console.groq.com/keys)

### 1. Clone the Repo

```
git clone git@github.com:rashadphz/farfalle.git
cd farfalle
```

### 2. Add Environment Variables
```
touch .env
```

Add the following variables to the .env file:

#### Required
```
TAVILY_API_KEY=...
```

#### Optional
```
# Cloud Models
OPENAI_API_KEY=...
GROQ_API_KEY=...
```

### 3. Run Containers
This requires Docker Compose version 2.22.0 or later.
```
docker-compose -f docker-compose.dev.yaml up -d
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
