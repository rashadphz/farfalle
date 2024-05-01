import asyncio
import json
from typing import Generator

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from chat import stream_qa_objects
from sse_starlette.sse import EventSourceResponse


from schemas import (
    ChatRequest,
    ChatResponseEvent,
)

load_dotenv()


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/chat")
async def chat(
    chat_request: ChatRequest, request: Request
) -> Generator[ChatResponseEvent, None, None]:
    async def generator():
        async for obj in stream_qa_objects(chat_request):
            yield json.dumps(jsonable_encoder(obj))
            await asyncio.sleep(0)

    return EventSourceResponse(generator(), media_type="text/event-stream")
