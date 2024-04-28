import { useMutation } from "@tanstack/react-query";
import { ChatRequest } from "../../generated";
import Error from "next/error";
import {
  fetchEventSource,
  FetchEventSourceInit,
} from "@microsoft/fetch-event-source";

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
  const { mutateAsync: chat } = useMutation<void, Error, ChatRequest>({
    mutationFn: async (request) => {
      await streamChat({
        request,
        onMessage: (event) => {
          console.log(event);
        },
      });
    },
  });

  const handleSend = async (request: ChatRequest) => {
    await chat(request);
  };

  return { handleSend };
};
