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


def configure_logging(app: FastAPI, logfire_token: str):
    if logfire_token:
        logfire.configure()
        logfire.instrument_fastapi(app)


def configure_rate_limiting(app: FastAPI, rate_limit_enabled: bool, redis_url: str):
    limiter = Limiter(
        key_func=get_ipaddr,
        enabled=rate_limit_enabled and bool(redis_url),
        storage_uri=redis_url,
    )
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


def configure_middleware(app: FastAPI, frontend_url: str):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[frontend_url, "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def create_app() -> FastAPI:
    app = FastAPI()
    configure_middleware(app, os.getenv("FRONTEND_URL"))
    configure_logging(app, os.getenv("LOGFIRE_TOKEN"))
    configure_rate_limiting(
        app, os.getenv("RATE_LIMIT_ENABLED", False), os.getenv("REDIS_URL")
    )
    return app


app = create_app()


@app.get("/")
async def root():
    return {"message": "Hello!"}


@app.post("/chat")
@app.state.limiter.limit("5/minute")
async def chat(
    chat_request: ChatRequest, request: Request
) -> Generator[ChatResponseEvent, None, None]:
    async def generator():
        async for obj in stream_qa_objects(chat_request):
            yield json.dumps(jsonable_encoder(obj))
            await asyncio.sleep(0)

    return EventSourceResponse(generator(), media_type="text/event-stream")
