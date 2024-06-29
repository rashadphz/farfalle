import asyncio
from enum import Enum
from time import sleep
from typing import AsyncIterator

from fastapi import HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.chat import rephrase_query_with_history
from backend.constants import get_model_string
from backend.llm.base import BaseLLM, EveryLLM
from backend.prompts import CHAT_PROMPT, QUERY_PLAN_PROMPT, SEARCH_QUERY_PROMPT
from backend.related_queries import generate_related_queries
from backend.schemas import (
    AgentFinishStream,
    AgentQueryPlanStream,
    AgentReadResultsStream,
    AgentSearchQueriesStream,
    BeginStream,
    ChatRequest,
    ChatResponseEvent,
    FinalResponseStream,
    RelatedQueriesStream,
    SearchResponse,
    SearchResult,
    SearchResultStream,
    StreamEndStream,
    StreamEvent,
    TextChunkStream,
)
from backend.search.search_service import perform_search
from backend.utils import is_local_model


class QueryPlanStep(BaseModel):
    id: int = Field(..., description="Unique id of the step")
    step: str
    dependencies: list[int] = Field(
        ...,
        description="List of step ids that this step depends on information from",
        default_factory=list,
    )


class QueryPlan(BaseModel):
    steps: list[QueryPlanStep] = Field(
        ..., description="The steps to complete the query", max_length=4
    )


class StepType(str, Enum):
    SEARCH = "search"
    SUMMARIZE = "summarize"


class QueryStepExecution(BaseModel):
    type: StepType = Field(..., description="The type of step to complete")
    search_queries: list[str] | None = Field(
        ..., description="The search queries to complete the step", max_length=3
    )


class StepContext(BaseModel):
    step: str
    context: str


async def build_context_from_search_queries(search_queries: list[str]) -> str:
    search_responses: list[SearchResponse] = await asyncio.gather(
        *[perform_search(query) for query in search_queries]
    )
    results = [result for response in search_responses for result in response.results]
    context = "\n".join(
        [f"Title: {result.title}\nContext: {result.content}" for result in results]
    )
    context = context[:7000]
    return context


def format_step_context(step_contexts: list[StepContext]) -> str:
    return "\n".join(
        [f"Step: {step.step}\nContext: {step.context}" for step in step_contexts]
    )


async def ranked_search_results_and_images_from_queries(
    queries: list[str],
) -> tuple[list[SearchResult], list[str]]:
    search_responses: list[SearchResponse] = await asyncio.gather(
        *(perform_search(query) for query in queries)
    )
    all_search_results = [response.results for response in search_responses]
    all_images = [response.images for response in search_responses]

    # interleave the search results, for fair ranking
    ranked_results: list[SearchResult] = [
        result for results in zip(*all_search_results) for result in results if result
    ]
    unique_results = list({result.url: result for result in ranked_results}.values())

    images = list({image: image for images in all_images for image in images}.values())
    return unique_results, images


def build_context_from_search_results(search_results: list[SearchResult]) -> str:
    context = "\n".join(str(result) for result in search_results)
    return context[:10000]


def format_context_with_steps(
    search_results_map: dict[int, list[SearchResult]],
    step_contexts: dict[int, StepContext],
) -> str:
    context = "\n".join(
        f"Everything below is context for step: {step_contexts[step_id].step}\nContext: {build_context_from_search_results(search_results_map[step_id])}\n{'-'*20}\n"
        for step_id in sorted(step_contexts.keys())
    )
    context = context[:15000]
    return context


async def stream_pro_search_objects(
    request: ChatRequest, llm: BaseLLM, query: str
) -> AsyncIterator[ChatResponseEvent]:
    query_plan_prompt = QUERY_PLAN_PROMPT.format(query=query)
    query_plan = llm.structured_complete(
        response_model=QueryPlan, prompt=query_plan_prompt
    )
    print(query_plan)

    yield ChatResponseEvent(
        event=StreamEvent.AGENT_QUERY_PLAN,
        data=AgentQueryPlanStream(steps=[step.step for step in query_plan.steps]),
    )

    step_context: dict[int, StepContext] = {}
    search_result_map: dict[int, list[SearchResult]] = {}
    image_map: dict[int, list[str]] = {}

    for idx, step in enumerate(query_plan.steps):
        step_id = step.id
        is_last_step = idx == len(query_plan.steps) - 1
        dependencies = step.dependencies

        relevant_context = [step_context[id] for id in dependencies]

        search_prompt = SEARCH_QUERY_PROMPT.format(
            step=step.step, prev_steps_context=format_step_context(relevant_context)
        )
        if not is_last_step:
            query_step_execution = llm.structured_complete(
                response_model=QueryStepExecution, prompt=search_prompt
            )
            search_queries = query_step_execution.search_queries
            if not search_queries:
                raise HTTPException(
                    status_code=500,
                    detail="There was an error generating the search queries",
                )

            yield ChatResponseEvent(
                event=StreamEvent.AGENT_SEARCH_QUERIES,
                data=AgentSearchQueriesStream(
                    queries=search_queries, step_number=step_id
                ),
            )

            (
                search_results,
                image_results,
            ) = await ranked_search_results_and_images_from_queries(search_queries)
            search_result_map[step_id] = search_results
            image_map[step_id] = image_results

            yield ChatResponseEvent(
                event=StreamEvent.AGENT_READ_RESULTS,
                data=AgentReadResultsStream(
                    results=search_results, step_number=step_id
                ),
            )
            context = build_context_from_search_results(search_results)
            step_context[step_id] = StepContext(step=step.step, context=context)
        else:
            # This is weird but it's to make the UI feel more responsive (definitely a better way to do this lol)
            sleep(0.7)

            yield ChatResponseEvent(
                event=StreamEvent.AGENT_FINISH,
                data=AgentFinishStream(),
            )

            yield ChatResponseEvent(
                event=StreamEvent.BEGIN_STREAM,
                data=BeginStream(query=query),
            )

            # Get 12 results total, but distribute them evenly across dependencies
            relevant_result_map: dict[int, list[SearchResult]] = {
                id: search_result_map[id] for id in dependencies
            }
            DESIRED_RESULT_COUNT = 12
            total_results = sum(
                len(results) for results in relevant_result_map.values()
            )
            results_per_dependency = min(
                DESIRED_RESULT_COUNT // len(dependencies),
                total_results // len(dependencies),
            )
            for id in dependencies:
                relevant_result_map[id] = search_result_map[id][:results_per_dependency]

            search_results = [
                result for results in relevant_result_map.values() for result in results
            ]

            # Remove duplicates
            search_results = list(
                {result.url: result for result in search_results}.values()
            )
            images = [image for id in dependencies for image in image_map[id][:2]]

            related_queries_task = None
            if not is_local_model(request.model):
                related_queries_task = asyncio.create_task(
                    generate_related_queries(query, search_results, llm)
                )

            yield ChatResponseEvent(
                event=StreamEvent.SEARCH_RESULTS,
                data=SearchResultStream(
                    results=search_results,
                    images=images,
                ),
            )

            fmt_qa_prompt = CHAT_PROMPT.format(
                my_context=format_context_with_steps(search_result_map, step_context),
                my_query=query,
            )

            full_response = ""
            response_gen = await llm.astream(fmt_qa_prompt)
            async for completion in response_gen:
                full_response += completion.delta or ""
                yield ChatResponseEvent(
                    event=StreamEvent.TEXT_CHUNK,
                    data=TextChunkStream(text=completion.delta or ""),
                )

            related_queries = await (
                related_queries_task
                if related_queries_task
                else generate_related_queries(query, search_results, llm)
            )

            yield ChatResponseEvent(
                event=StreamEvent.RELATED_QUERIES,
                data=RelatedQueriesStream(related_queries=related_queries),
            )

            yield ChatResponseEvent(
                event=StreamEvent.FINAL_RESPONSE,
                data=FinalResponseStream(message=full_response),
            )

            yield ChatResponseEvent(
                event=StreamEvent.STREAM_END,
                data=StreamEndStream(thread_id=None),
            )
            return


async def stream_pro_search_qa(
    request: ChatRequest, session: Session
) -> AsyncIterator[ChatResponseEvent]:
    try:
        model_name = get_model_string(request.model)
        llm = EveryLLM(model=model_name)

        query = rephrase_query_with_history(request.query, request.history, llm)
        async for event in stream_pro_search_objects(request, llm, query):
            yield event

    except Exception as e:
        detail = str(e)
        raise HTTPException(status_code=500, detail=detail)
