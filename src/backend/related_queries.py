import os

import groq
import instructor
import openai
from dotenv import load_dotenv

from backend.constants import ChatModel, model_mappings
from backend.prompts import RELATED_QUESTION_PROMPT
from backend.schemas import RelatedQueries, SearchResult

load_dotenv()


OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
# Extract API key from environment
openrouter_api_key = os.environ.get("OPENROUTER_API_KEY")
assert openrouter_api_key, "OPENROUTER_API_KEY is not set in environment variables"

# Base URL for OpenAI client
openrouter_api_base = os.environ.get("OPENROUTER_API_BASE")
assert openrouter_api_base, "OPENROUTER_BASE_URL is not set in environment variables"




def instructor_client(model: ChatModel) -> instructor.AsyncInstructor:
    if model in [
        ChatModel.GPT_3_5_TURBO,
        ChatModel.GPT_4o,
    ]:
        return instructor.from_openai(openai.AsyncOpenAI())
    if model in [
        ChatModel.OPENROUTER_GPT_3_5_TURBO,
        ChatModel.OPENROUTER_GPT_4o,
    ]:
        return instructor.from_openai(
            openai.AsyncOpenAI(
                base_url=openrouter_api_base,
                api_key=openrouter_api_key,
            ),
            mode=instructor.Mode.JSON,
        )
    elif model in [
        ChatModel.LOCAL_GEMMA,
        ChatModel.LOCAL_LLAMA_3,
        ChatModel.LOCAL_MISTRAL,
        ChatModel.LOCAL_PHI3_14B,
    ]:
        return instructor.from_openai(
            openai.AsyncOpenAI(
                base_url=f"{OLLAMA_HOST}/v1",
                api_key="ollama",
            ),
            mode=instructor.Mode.JSON,
        )
    elif model == ChatModel.LLAMA_3_70B:
        return instructor.from_groq(groq.AsyncGroq(), mode=instructor.Mode.JSON)
    else:
        raise ValueError(f"Unknown model: {model}")


async def generate_related_queries(
    query: str, search_results: list[SearchResult], model: ChatModel
) -> list[str]:
    context = "\n\n".join([f"{str(result)}" for result in search_results])
    client = instructor_client(model)
    model_name = model_mappings[model]

    related = await client.chat.completions.create(
        model=model_name,
        response_model=RelatedQueries,
        messages=[
            {
                "role": "user",
                "content": RELATED_QUESTION_PROMPT.format(query=query, context=context),
            },
        ],
    )

    return [query.lower().replace("?", "") for query in related.related_queries]
