import asyncio
import json
import os
import traceback
from typing import Generator

import logfire
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_ipaddr
from sse_starlette.sse import EventSourceResponse, ServerSentEvent

from backend.chat import stream_qa_objects
from backend.schemas import ChatRequest, ChatResponseEvent, ErrorStream, StreamEvent
from backend.utils import strtobool
from backend.validators import validate_model

load_dotenv()


def create_error_event(detail: str):
    obj = ChatResponseEvent(
        data=ErrorStream(detail=detail),
        event=StreamEvent.ERROR,
    )
    return ServerSentEvent(
        data=json.dumps(jsonable_encoder(obj)),
        event=StreamEvent.ERROR,
    )


def configure_logging(app: FastAPI, logfire_token: str | None):
    if logfire_token:
        logfire.configure()
        logfire.instrument_fastapi(app)


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    def generator():
        yield create_error_event("Rate limit exceeded, please try again later.")

    return EventSourceResponse(
        generator(),
        media_type="text/event-stream",
    )


def configure_rate_limiting(
    app: FastAPI, rate_limit_enabled: bool, redis_url: str | None
):
    limiter = Limiter(
        key_func=get_ipaddr,
        enabled=strtobool(rate_limit_enabled) and redis_url is not None,
        storage_uri=redis_url,
    )
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)


def configure_middleware(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def create_app() -> FastAPI:
    app = FastAPI()
    configure_middleware(app)
    configure_logging(app, os.getenv("LOGFIRE_TOKEN"))
    configure_rate_limiting(
        app,
        strtobool(os.getenv("RATE_LIMIT_ENABLED", False)),
        os.getenv("REDIS_URL"),
    )
    return app


app = create_app()


@app.post("/chat")
@app.state.limiter.limit("4/min")
async def chat(
    chat_request: ChatRequest, request: Request
) -> Generator[ChatResponseEvent, None, None]:
    async def generator():
        try:
            validate_model(chat_request.model)
            async for obj in stream_qa_objects(chat_request):
                if await request.is_disconnected():
                    break
                yield json.dumps(jsonable_encoder(obj))
                await asyncio.sleep(0)
        except Exception as e:
            print(traceback.format_exc())
            yield create_error_event(str(e))
            await asyncio.sleep(0)
            return

    return EventSourceResponse(generator(), media_type="text/event-stream")
