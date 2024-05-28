# Some of the code here is based on github.com/cohere-ai/cohere-toolkit/

import os
from enum import Enum
from typing import List, Union

from dotenv import load_dotenv
from logfire.integrations.pydantic import PluginSettings
from pydantic import BaseModel, Field

from backend.constants import ChatModel
from backend.utils import strtobool

load_dotenv()


record_all = PluginSettings(logfire={"record": "all"})


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"


class Message(BaseModel):
    content: str
    role: MessageRole


LOCAL_MODELS_ENABLED = strtobool(os.getenv("ENABLE_LOCAL_MODELS", False))


class ChatRequest(BaseModel, plugin_settings=record_all):
    query: str
    history: List[Message] = Field(default_factory=list)
    model: ChatModel = ChatModel.GPT_3_5_TURBO


class RelatedQueries(BaseModel):
    questions: List[str] = Field(..., min_length=3, max_length=3)


class SearchResult(BaseModel):
    title: str
    url: str
    content: str

    def __str__(self):
        return f"Title: {self.title}\nURL: {self.url}\n Summary: {self.content}"


class SearchResponse(BaseModel):
    results: List[SearchResult] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)


class StreamEvent(str, Enum):
    BEGIN_STREAM = "begin-stream"
    SEARCH_RESULTS = "search-results"
    TEXT_CHUNK = "text-chunk"
    RELATED_QUERIES = "related-queries"
    STREAM_END = "stream-end"
    FINAL_RESPONSE = "final-response"
    ERROR = "error"


class ChatObject(BaseModel):
    event_type: StreamEvent


class BeginStream(ChatObject, plugin_settings=record_all):
    event_type: StreamEvent = StreamEvent.BEGIN_STREAM
    query: str


class SearchResultStream(ChatObject, plugin_settings=record_all):
    event_type: StreamEvent = StreamEvent.SEARCH_RESULTS
    results: List[SearchResult] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)


class TextChunkStream(ChatObject):
    event_type: StreamEvent = StreamEvent.TEXT_CHUNK
    text: str


class RelatedQueriesStream(ChatObject, plugin_settings=record_all):
    event_type: StreamEvent = StreamEvent.RELATED_QUERIES
    related_queries: List[str] = Field(default_factory=list)


class StreamEndStream(ChatObject, plugin_settings=record_all):
    event_type: StreamEvent = StreamEvent.STREAM_END


class FinalResponseStream(ChatObject, plugin_settings=record_all):
    event_type: StreamEvent = StreamEvent.FINAL_RESPONSE
    message: str


class ErrorStream(ChatObject, plugin_settings=record_all):
    event_type: StreamEvent = StreamEvent.ERROR
    detail: str


class ChatResponseEvent(BaseModel):
    event: StreamEvent
    data: Union[
        BeginStream,
        SearchResultStream,
        TextChunkStream,
        RelatedQueriesStream,
        StreamEndStream,
        FinalResponseStream,
        ErrorStream,
    ]
