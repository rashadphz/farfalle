import asyncio
import os
from typing import AsyncIterator, List
from backend.constants import ChatModel
from backend.related_queries import generate_related_queries
from backend.utils import is_local_model
from fastapi import HTTPException

from llama_index.llms.openai import OpenAI

from backend.prompts import CHAT_PROMPT, HISTORY_QUERY_REPHRASE
from backend.constants import (
    model_mappings,
)
from backend.search import search_tavily
from llama_index.llms.groq import Groq
from llama_index.core.llms import LLM
from llama_index.llms.ollama import Ollama


from backend.schemas import (
    BeginStream,
    ChatRequest,
    ChatResponseEvent,
    FinalResponseStream,
    Message,
    RelatedQueriesStream,
    SearchResult,
    SearchResultStream,
    StreamEndStream,
    StreamEvent,
    TextChunkStream,
)


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
    if model in [ChatModel.GPT_3_5_TURBO, ChatModel.GPT_4o]:
        return OpenAI(model=model_mappings[model])
    elif model in [
        ChatModel.LOCAL_GEMMA,
        ChatModel.LOCAL_LLAMA_3,
        ChatModel.LOCAL_MISTRAL,
    ]:
        return Ollama(
            base_url=os.environ.get("OLLAMA_HOST", "http://localhost:11434"),
            model=model_mappings[model],
        )
    elif model == ChatModel.LLAMA_3_70B:
        return Groq(model=model_mappings[model])
    else:
        raise ValueError(f"Unknown model: {model}")


def format_context(search_results: List[SearchResult]) -> str:
    return "\n\n".join(
        [f"Citation {i+1}. {str(result)}" for i, result in enumerate(search_results)]
    )


async def stream_qa_objects(request: ChatRequest) -> AsyncIterator[ChatResponseEvent]:

    try:
        llm = get_llm(request.model)

        yield ChatResponseEvent(
            event=StreamEvent.BEGIN_STREAM,
            data=BeginStream(
                model=request.model,
                query=request.query,
                history=request.history,
            ),
        )

        query = rephrase_query_with_history(request.query, request.history, llm)

        search_response = search_tavily(query)

        search_results = search_response.results
        images = search_response.images

        # Only create the task first if the model is not local
        related_queries_task = None
        if not is_local_model(request.model):
            related_queries_task = asyncio.create_task(
                generate_related_queries(query, search_results, request.model)
            )

        yield ChatResponseEvent(
            event=StreamEvent.SEARCH_RESULTS,
            data=SearchResultStream(
                results=search_results,
                images=images,
            ),
        )

        fmt_qa_prompt = CHAT_PROMPT.format(
            my_context=format_context(search_results),
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

        related_queries = await (
            related_queries_task
            if related_queries_task
            else generate_related_queries(query, search_results, request.model)
        )

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
        print(e)
        raise HTTPException(
            status_code=500, detail="Model is at capacity. Please try again later."
        )
