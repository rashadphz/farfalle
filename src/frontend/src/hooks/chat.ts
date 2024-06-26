import { useMutation } from "@tanstack/react-query";
import {
  ChatMessage,
  ChatRequest,
  ChatResponseEvent,
  ErrorStream,
  Message,
  MessageRole,
  RelatedQueriesStream,
  SearchResult,
  SearchResultStream,
  StreamEndStream,
  StreamEvent,
  TextChunkStream,
} from "../../generated";
import Error from "next/error";
import {
  fetchEventSource,
  FetchEventSourceInit,
} from "@microsoft/fetch-event-source";
import { useState } from "react";
import { useConfigStore, useChatStore } from "@/stores";
import { env } from "../env.mjs";
import { useRouter } from "next/navigation";

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
      message.role === MessageRole.USER
        ? MessageRole.USER
        : MessageRole.ASSISTANT,
    content: message.content,
  }));
  return { query, history: newHistory };
};

export const useChat = () => {
  const { addMessage, messages, threadId, setThreadId } = useChatStore();
  const { model } = useConfigStore();
  const router = useRouter();

  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(
    null,
  );

  const handleEvent = (
    eventItem: ChatResponseEvent,
    state: {
      response: string;
      sources: SearchResult[];
      related_queries: string[];
      images: string[];
    },
  ) => {
    switch (eventItem.event) {
      case StreamEvent.BEGIN_STREAM:
        setStreamingMessage({
          role: MessageRole.ASSISTANT,
          content: "",
          related_queries: [],
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
        state.related_queries =
          (eventItem.data as RelatedQueriesStream).related_queries ?? [];
        break;
      case StreamEvent.STREAM_END:
        const endData = eventItem.data as StreamEndStream;
        addMessage({
          role: MessageRole.ASSISTANT,
          content: state.response,
          related_queries: state.related_queries,
          sources: state.sources,
          images: state.images,
        });
        setStreamingMessage(null);
        setThreadId(endData.thread_id);
        window.history.pushState({}, "", `/search/${endData.thread_id}`);
        return;
      case StreamEvent.FINAL_RESPONSE:
        return;
      case StreamEvent.ERROR:
        const errorData = eventItem.data as ErrorStream;
        addMessage({
          role: MessageRole.ASSISTANT,
          content: errorData.detail,
          related_queries: [],
          sources: [],
          images: [],
          is_error_message: true,
        });
        setStreamingMessage(null);
        return;
    }
    setStreamingMessage({
      role: MessageRole.ASSISTANT,
      content: state.response,
      related_queries: state.related_queries,
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
        related_queries: [],
        images: [],
      };
      addMessage({ role: MessageRole.USER, content: request.query });

      const req = {
        ...request,
        thread_id: threadId,
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
