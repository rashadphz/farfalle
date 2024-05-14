import asyncio
from typing import AsyncIterator, List

from llama_index.llms.openai import OpenAI

from backend.prompts import CHAT_PROMPT, RELATED_QUESTION_PROMPT, HISTORY_QUERY_REPHRASE
from backend.search import search_tavily
from llama_index.llms.groq import Groq

import instructor

from backend.schemas import (
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

GPT4_MODEL = "gpt-4o"
GPT3_MODEL = "gpt-3.5-turbo"
LLAMA_8B_MODEL = "llama3-8b-8192"
LLAMA_70B_MODEL = "llama3-70b-8192"


def rephrase_query_with_history(
    question: str, history: List[Message], llm: OpenAI
) -> str:
    if history:
        history_str = "\n".join([f"{msg.role}: {msg.content}" for msg in history])
        question = llm.complete(
            HISTORY_QUERY_REPHRASE.format(chat_history=history_str, question=question)
        ).text
        question = question.replace('"', "")
    return question


async def stream_qa_objects(request: ChatRequest) -> AsyncIterator[ChatResponseEvent]:

    llm = OpenAI(model=GPT4_MODEL)
    # llm = Groq(model=LLAMA_70B_MODEL)

    query = rephrase_query_with_history(request.query, request.history, llm)

    search_results = await search_tavily(query)

    related_queries_task = asyncio.create_task(
        generate_related_queries(query, search_results)
    )

    yield ChatResponseEvent(
        event=StreamEvent.SEARCH_RESULTS,
        data=SearchResultStream(
            results=search_results,
        ),
    )

    context_str = "\n\n".join(
        [f"Citation {i+1}. {str(result)}" for i, result in enumerate(search_results)]
    )

    fmt_qa_prompt = CHAT_PROMPT.format(
        my_context=context_str,
        my_query=query,
    )

    full_response = ""
    for completion in llm.stream_complete(fmt_qa_prompt):
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


async def generate_related_queries(
    query: str, search_results: list[SearchResult]
) -> list[str]:
    from openai import OpenAI

    context = "\n\n".join([f"{str(result)}" for result in search_results])
    client = instructor.from_openai(OpenAI())

    related = client.chat.completions.create(
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
