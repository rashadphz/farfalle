# Farfalle

Open-source AI-powered search engine. (Perplexity Clone)

Run your local LLM (**llama3**, **gemma**, **mistral**, **phi3**) or use  cloud models (**Groq/Llama3**, **OpenAI/gpt4-o**)

Demo answering questions with phi3 on my M1 Macbook Pro:

https://github.com/rashadphz/farfalle/assets/20783686/9cda83b8-0d3c-4a81-83ee-ff8cce323fee


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
- [ ] Chat History
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
docker run \
    -p 8000:8000 -p 3000:3000 -p 8080:8080 \
    --add-host=host.docker.internal:host-gateway \
    ghcr.io/rashadphz/farfalle:main
```

#### Optional
- `OPENAI_API_KEY`: Your OpenAI API key. Not required if you are using Ollama.
- `SEARCH_PROVIDER`: The search provider to use. Can be `tavily`, `serper`, `bing`, or `searxng`.
- `OPENAI_API_KEY`: Your OpenAI API key. Not required if you are using Ollama.
- `TAVILY_API_KEY`: Your Tavily API key.
- `SERPER_API_KEY`: Your Serper API key.
- `BING_API_KEY`: Your Bing API key.
- `GROQ_API_KEY`: Your Groq API key.
- `SEARXNG_BASE_URL`: The base URL for the SearXNG instance.

Add any env variable to the docker run command like so:
```
docker run \
    -e ENV_VAR_NAME1='YOUR_ENV_VAR_VALUE1' \
    -e ENV_VAR_NAME2='YOUR_ENV_VAR_VALUE2' \
    -p 8000:8000 -p 3000:3000 -p 8080:8080 \
    --add-host=host.docker.internal:host-gateway \
    ghcr.io/rashadphz/farfalle:main
```



Wait for the app to start then visit [http://localhost:3000](http://localhost:3000).

or follow the instructions below to clone the repo and run the app locally


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

#### Search Provider
You can use Tavily, Searxng, Serper, or Bing as the search provider.

**Searxng** (No API Key Required)
```
SEARCH_PROVIDER=searxng
```

**Tavily** (Requires API Key)
```
TAVILY_API_KEY=...
SEARCH_PROVIDER=tavily
```
**Serper** (Requires API Key)
```
SERPER_API_KEY=...
SEARCH_PROVIDER=serper
```

**Bing** (Requires API Key)
```
BING_API_KEY=...
SEARCH_PROVIDER=bing
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
