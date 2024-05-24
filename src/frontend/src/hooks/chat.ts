import { useMutation } from "@tanstack/react-query";
import {
  ChatRequest,
  ChatResponseEvent,
  ErrorStream,
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
import { useConfigStore, useMessageStore } from "@/stores";
import { useToast } from "@/components/ui/use-toast";
import { env } from "../env.mjs";

const BASE_URL = env.NEXT_PUBLIC_API_URL;

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
    keepalive: true,
    openWhenHidden: true,
    body: JSON.stringify({ ...request }),
    onmessage: onMessage,
    onerror: (error) => {},
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
  const { model } = useConfigStore();

  const [streamingMessage, setStreamingMessage] =
    useState<AssistantMessage | null>(null);

  const handleEvent = (
    eventItem: ChatResponseEvent,
    state: {
      response: string;
      sources: SearchResult[];
      relatedQuestions: string[];
      images: string[];
    },
  ) => {
    switch (eventItem.event) {
      case StreamEvent.BEGIN_STREAM:
        setStreamingMessage({
          role: MessageType.ASSISTANT,
          content: "",
          relatedQuestions: [],
          sources: [],
        });
        break;
      case StreamEvent.SEARCH_RESULTS:
        const data = eventItem.data as SearchResultStream;
        state.sources = data.results ?? [];
        state.images = data.images ?? [];
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
          images: state.images,
        });
        setStreamingMessage(null);
        return;
      case StreamEvent.FINAL_RESPONSE:
        return;
      case StreamEvent.ERROR:
        const errorData = eventItem.data as ErrorStream;
        addMessage({
          role: MessageType.ASSISTANT,
          content: errorData.detail,
          relatedQuestions: [],
          sources: [],
          images: [],
          isErrorMessage: true,
        });
        setStreamingMessage(null);
        return;
    }
    setStreamingMessage({
      role: MessageType.ASSISTANT,
      content: state.response,
      relatedQuestions: state.relatedQuestions,
      sources: state.sources,
      images: state.images,
    });
  };

  const { mutateAsync: chat } = useMutation<void, Error, ChatRequest>({
    retry: false,
    mutationFn: async (request) => {
      const state = {
        response: "",
        sources: [],
        relatedQuestions: [],
        images: [],
      };
      addMessage({ role: MessageType.USER, content: request.query });

      const req = {
        ...request,
        model,
      };
      await streamChat({
        request: req,
        onMessage: (event) => {
          // Handles keep-alive events
          if (!event.data) return;

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
