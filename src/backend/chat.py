import asyncio
from typing import AsyncIterator, List
from fastapi import HTTPException

from llama_index.llms.openai import OpenAI

from backend.prompts import CHAT_PROMPT, RELATED_QUESTION_PROMPT, HISTORY_QUERY_REPHRASE
from backend.search import search_tavily
from llama_index.llms.groq import Groq
from llama_index.core.llms import LLM

import instructor

from backend.schemas import (
    ChatModel,
    ChatRequest,
    ChatResponseEvent,
    FinalResponseStream,
    Message,
    RelatedQueries,
    RelatedQueriesStream,
    SearchResult,
    SearchResultStream,
    StreamEndStream,
    StreamEvent,
    TextChunkStream,
)
import openai

GPT4_MODEL = "gpt-4o"
GPT3_MODEL = "gpt-3.5-turbo"
LLAMA_8B_MODEL = "llama3-8b-8192"
LLAMA_70B_MODEL = "llama3-70b-8192"


def rephrase_query_with_history(question: str, history: List[Message], llm: LLM) -> str:
    try:

        if history:
            history_str = "\n".join([f"{msg.role}: {msg.content}" for msg in history])
            question = llm.complete(
                HISTORY_QUERY_REPHRASE.format(
                    chat_history=history_str, question=question
                )
            ).text
            question = question.replace('"', "")
        return question
    except Exception:
        raise HTTPException(
            status_code=500, detail="Model is at capacity. Please try again later."
        )


def get_llm(model: ChatModel) -> LLM:
    if model == ChatModel.LLAMA_3_70B:
        return Groq(model=LLAMA_70B_MODEL)
    elif model == ChatModel.GPT_4o:
        return OpenAI(model=GPT4_MODEL)
    elif model == ChatModel.GPT_3_5_TURBO:
        return OpenAI(model=GPT3_MODEL)
    else:
        raise ValueError(f"Unknown model: {model}")


async def stream_qa_objects(request: ChatRequest) -> AsyncIterator[ChatResponseEvent]:

    try:

        llm = get_llm(request.model)
        query = rephrase_query_with_history(request.query, request.history, llm)

        search_response = search_tavily(query)

        search_results = search_response.results
        images = search_response.images

        related_queries_task = asyncio.create_task(
            generate_related_queries(query, search_results)
        )

        yield ChatResponseEvent(
            event=StreamEvent.SEARCH_RESULTS,
            data=SearchResultStream(
                results=search_results,
                images=images,
            ),
        )

        context_str = "\n\n".join(
            [
                f"Citation {i+1}. {str(result)}"
                for i, result in enumerate(search_results)
            ]
        )

        fmt_qa_prompt = CHAT_PROMPT.format(
            my_context=context_str,
            my_query=query,
        )

        full_response = ""
        response_gen = await llm.astream_complete(fmt_qa_prompt)
        async for completion in response_gen:
            full_response += completion.delta or ""
            yield ChatResponseEvent(
                event=StreamEvent.TEXT_CHUNK,
                data=TextChunkStream(text=completion.delta or ""),
            )
        related_queries = await related_queries_task
        yield ChatResponseEvent(
            event=StreamEvent.RELATED_QUERIES,
            data=RelatedQueriesStream(related_queries=related_queries),
        )

        yield ChatResponseEvent(
            event=StreamEvent.STREAM_END,
            data=StreamEndStream(),
        )

        yield ChatResponseEvent(
            event=StreamEvent.FINAL_RESPONSE,
            data=FinalResponseStream(message=full_response),
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Model is at capacity. Please try again later."
        )


async def generate_related_queries(
    query: str, search_results: list[SearchResult]
) -> list[str]:
    from openai import AsyncOpenAI

    context = "\n\n".join([f"{str(result)}" for result in search_results])
    client = instructor.from_openai(AsyncOpenAI())

    related = await client.chat.completions.create(
        model=GPT3_MODEL,
        response_model=RelatedQueries,
        messages=[
            {
                "role": "user",
                "content": RELATED_QUESTION_PROMPT.format(query=query, context=context),
            },
        ],
    )

    return [query.lower().replace("?", "") for query in related.related_queries]
