import { useQuery } from "@tanstack/react-query";
import { env } from "@/env.mjs";
import { ChatSnapshot } from "../../generated";

const BASE_URL = env.NEXT_PUBLIC_API_URL;

export const fetchChatHistory = async (): Promise<ChatSnapshot[]> => {
  const response = await fetch(`${BASE_URL}/history`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch chat history");
  }
  const data = await response.json();
  return data.snapshots;
};

export const useChatHistory = () => {
  return useQuery<ChatSnapshot[], Error>({
    queryKey: ["chatHistory"],
    queryFn: fetchChatHistory,
    retry: false,
  });
};
