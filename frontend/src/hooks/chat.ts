import { useMutation } from "@tanstack/react-query";
import {
  ChatRequest,
  ChatResponseEvent,
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
import { AssistantMessage, MessageType } from "@/types";

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

export const useChat = () => {
  const [streamingMessage, setStreamingMessage] =
    useState<AssistantMessage | null>(null);

  const { mutateAsync: chat } = useMutation<void, Error, ChatRequest>({
    mutationFn: async (request) => {
      let response = "";
      let sources: SearchResult[] = [];
      let relatedQuestions: string[] = [];

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
          switch (eventItem.event) {
            case StreamEvent.SEARCH_RESULTS: {
              const data = eventItem.data as SearchResultStream;
              sources = data.results ?? [];
            }
            case StreamEvent.TEXT_CHUNK: {
              const data = eventItem.data as TextChunkStream;
              response += data.text ?? "";
              break;
            }
            case StreamEvent.RELATED_QUERIES: {
              const data = eventItem.data as RelatedQueriesStream;
              relatedQuestions = data.related_queries ?? [];
            }
          }

          setStreamingMessage({
            role: MessageType.ASSISTANT,
            content: response,
            relatedQuestions,
            sources,
          });
        },
      });
    },
  });

  const handleSend = async (request: ChatRequest) => {
    await chat(request);
  };

  return { handleSend, streamingMessage };
};
