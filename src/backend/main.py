import asyncio
import json
import os
from typing import Generator

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from backend.chat import stream_qa_objects
from sse_starlette.sse import EventSourceResponse
import logfire


from backend.schemas import (
    ChatRequest,
    ChatResponseEvent,
)

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_ipaddr
from slowapi.errors import RateLimitExceeded


load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL")


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
try:
    if os.getenv("LOGFIRE_TOKEN"):
        logfire.configure()
        logfire.instrument_fastapi(app)
except Exception as e:
    print("Logfire not configured")

# Rate Limiting
try:
    rate_limit_enabled = os.getenv("RATE_LIMIT_ENABLED", False)
    redis_url = os.getenv("REDIS_URL")
    enabled = rate_limit_enabled and redis_url
    limiter = Limiter(key_func=get_ipaddr, enabled=enabled, storage_uri=redis_url)
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
except Exception as e:
    limiter = Limiter(key_func=get_ipaddr, enabled=False)
    print("Rate limiting not configured")


@app.get("/")
async def root():
    return {"message": "Hello!"}


@app.post("/chat")
@limiter.limit("5/minute")
async def chat(
    chat_request: ChatRequest, request: Request
) -> Generator[ChatResponseEvent, None, None]:
    async def generator():
        async for obj in stream_qa_objects(chat_request):
            yield json.dumps(jsonable_encoder(obj))
            await asyncio.sleep(0)

    return EventSourceResponse(generator(), media_type="text/event-stream")
