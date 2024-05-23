from backend.constants import ChatModel


def is_local_model(model: ChatModel) -> bool:
    return model in [
        ChatModel.LOCAL_LLAMA_3,
        ChatModel.LOCAL_GEMMA,
        ChatModel.LOCAL_MISTRAL,
        ChatModel.LOCAL_PHI3_14B,
    ]


def strtobool(val: str | bool) -> bool:
    if isinstance(val, bool):
        return val
    return val.lower() in ("true", "1", "t")
