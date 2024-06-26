import asyncio
import json
import os
import traceback
from datetime import datetime, timedelta
from typing import Generator

import logfire
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_ipaddr
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse, ServerSentEvent

from backend.chat import stream_qa_objects
from backend.db.engine import get_session
from backend.schemas import (
    ChatHistoryResponse,
    ChatRequest,
    ChatResponseEvent,
    ChatSnapshot,
    ErrorStream,
    StreamEvent,
)
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
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)  # type: ignore


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
    chat_request: ChatRequest, request: Request, session: Session = Depends(get_session)
) -> Generator[ChatResponseEvent, None, None]:
    async def generator():
        try:
            validate_model(chat_request.model)
            async for obj in stream_qa_objects(request=chat_request, session=session):
                if await request.is_disconnected():
                    break
                yield json.dumps(jsonable_encoder(obj))
                await asyncio.sleep(0)
        except Exception as e:
            print(traceback.format_exc())
            yield create_error_event(str(e))
            await asyncio.sleep(0)
            return

    return EventSourceResponse(generator(), media_type="text/event-stream")  # type: ignore


@app.get("/history")
async def recents() -> ChatHistoryResponse:
    fake_snapshots = [
        ChatSnapshot(
            title="test 1",
            date=datetime.now() - timedelta(days=1),
            preview="preview 1",
        ),
        ChatSnapshot(
            title="test 2",
            date=datetime.now() - timedelta(days=2),
            preview="preview 2",
        ),
        ChatSnapshot(
            title="test 3",
            date=datetime.now() - timedelta(days=3),
            preview="preview 3",
        ),
    ]

    return ChatHistoryResponse(snapshots=fake_snapshots)
