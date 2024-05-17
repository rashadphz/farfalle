import instructor
import openai
import groq
from backend.constants import ChatModel


def instructor_client(model: ChatModel) -> instructor.Instructor:

    if model in [
        ChatModel.GPT_3_5_TURBO,
        ChatModel.GPT_4o,
    ]:
        return instructor.from_openai(openai.AsyncOpenAI())
    elif model == ChatModel.LLAMA_3_70B:
        return instructor.from_groq(groq.AsyncGroq(), mode=instructor.Mode.JSON)
    elif model in [ChatModel.LOCAL_GEMMA, ChatModel.LOCAL_LLAMA_3]:
        return instructor.from_openai(
            openai.AsyncOpenAI(
                base_url="http://localhost:11434/v1",
                api_key="ollama",
            ),
            mode=instructor.Mode.JSON,
        )
    else:
        raise ValueError(f"Unknown model: {model}")
