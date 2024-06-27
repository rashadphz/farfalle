import { useQuery } from "@tanstack/react-query";
import { env } from "@/env.mjs";
import { ThreadResponse } from "../../generated";

const BASE_URL = env.NEXT_PUBLIC_API_URL;

const fetchChatThread = async (threadId: number): Promise<ThreadResponse> => {
  const response = await fetch(`${BASE_URL}/thread/${threadId}`);
  return await response.json();
};

export const useChatThread = (threadId?: number) => {
  const { data, isLoading, error } = useQuery<ThreadResponse | null, Error>({
    queryKey: ["thread", threadId],
    queryFn: async () => {
      if (!threadId) {
        return null;
      }
      return fetchChatThread(threadId);
    },
  });
  return { data, isLoading, error };
};
