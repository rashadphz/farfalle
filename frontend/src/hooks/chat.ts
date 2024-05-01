import { useMutation } from "@tanstack/react-query";
import {
  ChatRequest,
  ChatResponseEvent,
  Message,
  MessageRole,
  RelatedQueriesStream,
  SearchResult,
  SearchResultStream,
  StreamEvent,
  TextChunkStream,
} from "../../generated";
import Error from "next/error";
import {
  fetchEventSource,
  FetchEventSourceInit,
} from "@microsoft/fetch-event-source";
import { useState } from "react";
import { AssistantMessage, ChatMessage, MessageType } from "@/types";
import { useMessageStore } from "@/stores";

const BASE_URL = "http://127.0.0.1:8000";

const streamChat = async ({
  request,
  onMessage,
}: {
  request: ChatRequest;
  onMessage?: FetchEventSourceInit["onmessage"];
}): Promise<void> => {
  return await fetchEventSource(`${BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...request }),
    onmessage: onMessage,
  });
};

const convertToChatRequest = (query: string, history: ChatMessage[]) => {
  const newHistory: Message[] = history.map((message) => ({
    role:
      message.role === MessageType.USER
        ? MessageRole.USER
        : MessageRole.ASSISTANT,
    content: message.content,
  }));
  return { query, history: newHistory };
};

export const useChat = () => {
  const { addMessage, messages } = useMessageStore();

  const [streamingMessage, setStreamingMessage] =
    useState<AssistantMessage | null>(null);

  const handleEvent = (
    eventItem: ChatResponseEvent,
    state: {
      response: string;
      sources: SearchResult[];
      relatedQuestions: string[];
    }
  ) => {
    switch (eventItem.event) {
      case StreamEvent.SEARCH_RESULTS:
        state.sources = (eventItem.data as SearchResultStream).results ?? [];
        break;
      case StreamEvent.TEXT_CHUNK:
        state.response += (eventItem.data as TextChunkStream).text ?? "";
        break;
      case StreamEvent.RELATED_QUERIES:
        state.relatedQuestions =
          (eventItem.data as RelatedQueriesStream).related_queries ?? [];
        break;
      case StreamEvent.STREAM_END:
        addMessage({
          role: MessageType.ASSISTANT,
          content: state.response,
          relatedQuestions: state.relatedQuestions,
          sources: state.sources,
        });
        setStreamingMessage(null);
        return;
    }
    setStreamingMessage({
      role: MessageType.ASSISTANT,
      content: state.response,
      relatedQuestions: state.relatedQuestions,
      sources: state.sources,
    });
  };

  const { mutateAsync: chat } = useMutation<void, Error, ChatRequest>({
    retry: false,
    mutationFn: async (request) => {
      const state = { response: "", sources: [], relatedQuestions: [] };
      addMessage({ role: MessageType.USER, content: request.query });

      setStreamingMessage({
        role: MessageType.ASSISTANT,
        content: "",
        relatedQuestions: [],
        sources: [],
      });

      await streamChat({
        request,
        onMessage: (event) => {
          const eventItem: ChatResponseEvent = JSON.parse(event.data);
          handleEvent(eventItem, state);
        },
      });
    },
  });

  const handleSend = async (query: string) => {
    await chat(convertToChatRequest(query, messages));
  };

  return { handleSend, streamingMessage };
};
