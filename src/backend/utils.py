from backend.constants import ChatModel


def is_local_model(model: ChatModel) -> bool:
    return model in [
        ChatModel.LOCAL_LLAMA_3,
        ChatModel.LOCAL_GEMMA,
        ChatModel.LOCAL_MISTRAL,
    ]


def strtobool(val: str) -> bool:
    return val.lower() in ("true", "1", "t")
