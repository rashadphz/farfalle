import { ChatMessage } from "@/types";
import { create } from "zustand";

interface MessageStoreState {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
}

export const useMessageStore = create<MessageStoreState>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));
