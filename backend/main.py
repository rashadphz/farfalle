import asyncio
import json
from typing import AsyncGenerator, AsyncIterator
from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import time

import httpx

from schemas import (
    ChatRequest,
    ChatResponseEvent,
    RelatedQueriesStream,
    SearchQueryStream,
    SearchResult,
    SearchResultStream,
    StreamEvent,
    TextChunkStream,
    StreamEndStream,
)


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


fake_query = "Rashad Philizaire"
fake_search_results = [
    SearchResult(
        title="rashadphz",
        content="Hi, I'm Rashad. I'm an honors CS student at UT Austin. I'm interested in backend development, infra and search & retrieval.",
        url="https://www.rashadphz.com/",
    ),
    SearchResult(
        title="Rashad Philizaire - The University of Texas at Austin - LinkedIn",
        content="Rashad Philizaire Turing Scholar @ UT Austin Washington DC-Baltimore Area Software Engineer Intern Stripe May 2023 - August 2023 • 4 months New York City Metropolitan Area Meta University Engineering Intern Meta June 2022 - August...",
        url="https://www.linkedin.com/in/rashadphz/",
    ),
]

fake_response = "Rashad Philizaire is a computer science student at the University of Texas at Austin, where he is a Turing Scholar. He has previously interned at Stripe, Meta, and Yext."

fake_related_queries = [
    "what are rashad philizaire's skills and interests",
    "what companies has rashad philizaire worked for",
    "what is rashad philizaire's educational background",
]


@app.post("/search")
async def search(request: ChatRequest) -> StreamingResponse:
    async def generator():
        async for obj in stream_qa_objects(request):
            yield json.dumps(jsonable_encoder(obj))

    return StreamingResponse(generator(), media_type="application/json")


async def stream_qa_objects(request: ChatRequest) -> AsyncIterator[ChatResponseEvent]:
    # Temporary streaming response
    yield ChatResponseEvent(
        event=StreamEvent.SEARCH_QUERY,
        data=SearchQueryStream(query=fake_query),
    )

    await asyncio.sleep(1)

    yield ChatResponseEvent(
        event=StreamEvent.SEARCH_RESULTS,
        data=SearchResultStream(
            results=fake_search_results,
        ),
    )

    for word in fake_response.split():
        yield ChatResponseEvent(
            event=StreamEvent.TEXT_CHUNK,
            data=TextChunkStream(text=word),
        )
        await asyncio.sleep(0.1)

    yield ChatResponseEvent(
        event=StreamEvent.RELATED_QUERIES,
        data=RelatedQueriesStream(related_queries=fake_related_queries),
    )

    yield ChatResponseEvent(
        event=StreamEvent.STREAM_END,
        data=StreamEndStream(),
    )


async def main():
    url = "http://127.0.0.1:8000/search"

    async with httpx.AsyncClient() as client:
        async with client.stream(
            "POST",
            url,
            json=ChatRequest(query="Rashad Philizaire", history=[]).model_dump(),
        ) as response:
            async for chunk in response.aiter_text():
                print(chunk)


if __name__ == "__main__":
    asyncio.run(main())
