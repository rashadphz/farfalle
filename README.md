# Farfalle

Open-source AI-powered search engine. (Perplexity Clone)

Run local LLMs (**llama3**, **gemma**, **mistral**, **phi3**), custom LLMs through **LiteLLM**, or use cloud models (**Groq/Llama3**, **OpenAI/gpt4-o**)

https://github.com/rashadphz/farfalle/assets/20783686/9527a8c9-a13b-4e53-9cda-a3ab28d671b2

Please feel free to contact me on [Twitter](https://twitter.com/rashadphz) or [create an issue](https://github.com/rashadphz/farfalle/issues/new) if you have any questions.

## 💻 Live Demo

[farfalle.dev](https://farfalle.dev/) (Cloud models only)

## 📖 Overview

- 🛠️ [Tech Stack](#%EF%B8%8F-tech-stack)
- 🏃🏿‍♂️ [Getting Started](#%EF%B8%8F-getting-started)
- 🚀 [Deploy](#-deploy)

## 🛣️ Roadmap

- [x] Add support for local LLMs through Ollama
- [x] Docker deployment setup
- [x] Add support for [searxng](https://github.com/searxng/searxng). Eliminates the need for external dependencies.
- [x] Create a pre-built Docker Image
- [x] Add support for custom LLMs through LiteLLM
- [x] Chat History
- [x] Expert Search
- [ ] Chat with local files



## 🛠️ Tech Stack

- Frontend: [Next.js](https://nextjs.org/)
- Backend: [FastAPI](https://fastapi.tiangolo.com/)
- Search API: [SearXNG](https://github.com/searxng/searxng), [Tavily](https://tavily.com/), [Serper](https://serper.dev/), [Bing](https://www.microsoft.com/en-us/bing/apis/bing-web-search-api)
- Logging: [Logfire](https://pydantic.dev/logfire)
- Rate Limiting: [Redis](https://redis.io/)
- Components: [shadcn/ui](https://ui.shadcn.com/)


## Features
- Search with multiple search providers (Tavily, Searxng, Serper, Bing)
- Answer questions with cloud models (OpenAI/gpt4-o, OpenAI/gpt3.5-turbo, Groq/Llama3)
- Answer questions with local models (llama3, mistral, gemma, phi3)
- Answer questions with any custom LLMs through [LiteLLM](https://litellm.vercel.app/docs/providers)
- Search with an agent that plans and executes the search for better results

## 🏃🏿‍♂️ Getting Started Locally

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Ollama](https://ollama.com/download) (If running local models)
  - Download any of the supported models: **llama3**, **mistral**, **gemma**, **phi3**
  - Start ollama server `ollama serve`

### Get API Keys

- [Tavily (Optional)](https://app.tavily.com/home)
- [Serper (Optional)](https://serper.dev/dashboard)
- [OpenAI (Optional)](https://platform.openai.com/api-keys)
- [Bing (Optional)](https://www.microsoft.com/en-us/bing/apis/bing-web-search-api)
- [Groq (Optional)](https://console.groq.com/keys)

### Quick Start:
```
git clone https://github.com/rashadphz/farfalle.git
cd farfalle && cp .env-template .env
```
Modify .env with your API keys (Optional, not required if using Ollama)

Start the app:
```
docker-compose -f docker-compose.dev.yaml up -d
```

Wait for the app to start then visit [http://localhost:3000](http://localhost:3000).

### Dynamic Port Allocation (Recommended)

If you encounter port conflicts (e.g., port 8000 is already in use), use the dynamic port allocation system:

```bash
# This will automatically find an available port and start the services
./docker-scripts/start-dev.sh
```

Or manually set up dynamic ports:
```bash
# Find available port and update configuration
./docker-scripts/dynamic-port-setup.sh

# Start services with the new configuration
docker-compose -f docker-compose.dev.yaml -f docker-compose.override.yaml up
```

The system will automatically:
- Find an available port starting from 8000
- Update environment variables
- Create a Docker Compose override file
- Ensure frontend connects to the correct backend port

For custom setup instructions, see [custom-setup-instructions.md](/custom-setup-instructions.md)

## 🚀 Deploy

### Backend

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/rashadphz/farfalle)

After the backend is deployed, copy the web service URL to your clipboard.
It should look something like: https://some-service-name.onrender.com.

### Frontend

Use the copied backend URL in the `NEXT_PUBLIC_API_URL` environment variable when deploying with Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frashadphz%2Ffarfalle&env=NEXT_PUBLIC_API_URL&envDescription=URL%20for%20your%20backend%20application.%20For%20backends%20deployed%20with%20Render%2C%20the%20URL%20will%20look%20like%20this%3A%20https%3A%2F%2F%5Bsome-hostname%5D.onrender.com&root-directory=src%2Ffrontend)

And you're done! 🥳


## Use Farfalle as a Search Engine

To use Farfalle as your default search engine, follow these steps:
1. Visit the settings of your browser
2. Go to 'Search Engines'
3. Create a new search engine entry using this URL: http://localhost:3000/?q=%s.
4. Add the search engine.
