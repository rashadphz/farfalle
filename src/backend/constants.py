from backend.schemas import ChatModel


GPT4_MODEL = "gpt-4o"
GPT3_MODEL = "gpt-3.5-turbo"
LLAMA_8B_MODEL = "llama3-8b-8192"
LLAMA_70B_MODEL = "llama3-70b-8192"
LOCAL_LLAMA3_MODEL = "llama3"
LOCAL_GEMMA_MODEL = "gemma:2b"

model_mappings: dict[ChatModel, str] = {
    ChatModel.GPT_3_5_TURBO: GPT3_MODEL,
    ChatModel.GPT_4o: GPT4_MODEL,
    ChatModel.LLAMA_3_70B: LLAMA_70B_MODEL,
    ChatModel.LOCAL_LLAMA_3: LOCAL_LLAMA3_MODEL,
    ChatModel.LOCAL_GEMMA: LOCAL_GEMMA_MODEL,
}
