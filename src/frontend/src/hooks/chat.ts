import { useMutation } from "@tanstack/react-query";
import {
  AgentQueryPlanStream,
  AgentReadResultsStream,
  AgentSearchFullResponse,
  AgentSearchQueriesStream,
  AgentSearchStep,
  AgentSearchStepStatus,
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
  const { model, proMode } = useConfigStore();

  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(
    null,
  );
  const [isStreamingProSearch, setIsStreamingProSearch] = useState(false);
  const [isStreamingMessage, setIsStreamingMessage] = useState(false);

  let steps_details: AgentSearchStep[] = [];

  const handleEvent = (eventItem: ChatResponseEvent, state: ChatMessage) => {
    switch (eventItem.event) {
      case StreamEvent.BEGIN_STREAM:
        setIsStreamingMessage(true);
        setStreamingMessage({
          ...state,
          role: MessageRole.ASSISTANT,
          content: "",
          related_queries: [],
          sources: [],
          images: [],
        });
        break;
      case StreamEvent.SEARCH_RESULTS:
        const data = eventItem.data as SearchResultStream;
        state.sources = data.results ?? [];
        state.images = data.images ?? [];
        break;
      case StreamEvent.TEXT_CHUNK:
        state.content += (eventItem.data as TextChunkStream).text;

        if (!state.agent_response) {
          break;
        }
        // Hide the pro search once we start streaming
        steps_details = steps_details.map((step) => ({
          ...step,
          status: AgentSearchStepStatus.DONE,
        }));
        state.agent_response = {
          steps_details: steps_details,
        };

        break;
      case StreamEvent.RELATED_QUERIES:
        state.related_queries =
          (eventItem.data as RelatedQueriesStream).related_queries ?? [];
        break;
      case StreamEvent.STREAM_END:
        const endData = eventItem.data as StreamEndStream;
        addMessage({ ...state });
        setStreamingMessage(null);
        setIsStreamingMessage(false);
        setIsStreamingProSearch(false);

        // Only if the backend is using the DB
        if (endData.thread_id) {
          setThreadId(endData.thread_id);
          window.history.pushState({}, "", `/search/${endData.thread_id}`);
        }
        return;
      case StreamEvent.AGENT_QUERY_PLAN:
        const { steps } = eventItem.data as AgentQueryPlanStream;
        steps_details =
          steps?.map((step, index) => ({
            step: step,
            queries: [],
            results: [],
            status: AgentSearchStepStatus.DEFAULT,
            step_number: index,
          })) ?? [];

        steps_details[0].status = AgentSearchStepStatus.CURRENT;
        state.agent_response = {
          steps_details: steps_details,
        };
        break;
      case StreamEvent.AGENT_SEARCH_QUERIES:
        const { queries, step_number: queryStepNumber } =
          eventItem.data as AgentSearchQueriesStream;
        steps_details[queryStepNumber].queries = queries;
        steps_details[queryStepNumber].status = AgentSearchStepStatus.CURRENT;
        if (queryStepNumber !== 0) {
          steps_details[queryStepNumber - 1].status =
            AgentSearchStepStatus.DONE;
        }
        state.agent_response = {
          steps_details: steps_details,
        };
        break;
      case StreamEvent.AGENT_READ_RESULTS:
        const { results, step_number: resultsStepNumber } =
          eventItem.data as AgentReadResultsStream;
        steps_details[resultsStepNumber].results = results;

        break;
      case StreamEvent.AGENT_FINISH:
        break;
      case StreamEvent.ERROR:
        const errorData = eventItem.data as ErrorStream;
        addMessage({
          role: MessageRole.ASSISTANT,
          content: errorData.detail,
          related_queries: [],
          sources: [],
          images: [],
          agent_response: state.agent_response,
          is_error_message: true,
        });
        setStreamingMessage(null);
        setIsStreamingMessage(false);
        setIsStreamingProSearch(false);
        return;
    }
    setStreamingMessage({
      role: MessageRole.ASSISTANT,
      content: state.content,
      related_queries: state.related_queries,
      sources: state.sources,
      images: state.images,
      agent_response:
        state.agent_response !== null
          ? {
              steps: steps_details.map((step) => step.step),
              steps_details: steps_details,
            }
          : null,
    });
  };

  const { mutateAsync: chat } = useMutation<void, Error, ChatRequest>({
    retry: false,
    mutationFn: async (request) => {
      const state: ChatMessage = {
        role: MessageRole.ASSISTANT,
        content: "",
        sources: [],
        related_queries: [],
        images: [],
        agent_response: null,
      };
      addMessage({ role: MessageRole.USER, content: request.query });
      setIsStreamingProSearch(proMode);

      const req = {
        ...request,
        thread_id: threadId,
        model,
        pro_search: proMode,
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

  return {
    handleSend,
    streamingMessage,
    isStreamingMessage,
    isStreamingProSearch,
  };
};
