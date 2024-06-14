import os
from enum import Enum

from dotenv import load_dotenv

load_dotenv()


class ChatModel(str, Enum):
    LLAMA_3_70B = "llama-3-70b"
    GPT_4o = "gpt-4o"
    GPT_3_5_TURBO = "gpt-3.5-turbo"

    # Local models
    LOCAL_LLAMA_3 = "llama3"
    LOCAL_GEMMA = "gemma"
    LOCAL_MISTRAL = "mistral"
    LOCAL_PHI3_14B = "phi3:14b"


model_mappings: dict[ChatModel, str] = {
    ChatModel.GPT_3_5_TURBO: "gpt-3.5-turbo",
    ChatModel.GPT_4o: "gpt-4o",
    ChatModel.LLAMA_3_70B: "groq/llama3-70b-8192",
    ChatModel.LOCAL_LLAMA_3: "ollama_chat/llama3",
    ChatModel.LOCAL_GEMMA: "ollama_chat/gemma",
    ChatModel.LOCAL_MISTRAL: "ollama_chat/mistral",
    ChatModel.LOCAL_PHI3_14B: "ollama_chat/phi3:14b",
}


def get_model_string(model: ChatModel) -> str:
    if model in {ChatModel.GPT_3_5_TURBO, ChatModel.GPT_4o}:
        openai_mode = os.environ.get("OPENAI_MODE", "openai")
        if openai_mode == "azure":
            # Currently deployments are named "gpt-35-turbo" and "gpt-4o"
            name = model_mappings[model].replace(".", "")
            return f"azure/{name}"

    return model_mappings[model]
