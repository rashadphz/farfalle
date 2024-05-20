import os

from backend.constants import ChatModel
from backend.utils import is_local_model, strtobool


def validate_model(model: ChatModel):
    if model in {ChatModel.GPT_3_5_TURBO, ChatModel.GPT_4o}:
        OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        if not OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY environment variable not found")
        if model == ChatModel.GPT_4o:
            GPT4_ENABLED = strtobool(os.getenv("GPT4_ENABLED", True))
            if not GPT4_ENABLED:
                raise ValueError(
                    "GPT4-o has been disabled. Please try a different model or self-host the app by following the instructions here: https://github.com/rashadphz/farfalle"
                )

    elif model == ChatModel.LLAMA_3_70B:
        GROQ_API_KEY = os.getenv("GROQ_API_KEY")
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY environment variable not found")
    elif is_local_model(model):
        LOCAL_MODELS_ENABLED = strtobool(os.getenv("ENABLE_LOCAL_MODELS", False))
        if not LOCAL_MODELS_ENABLED:
            raise ValueError("Local models are not enabled")
    else:
        raise ValueError("Invalid model")
    return True
