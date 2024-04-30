import { ChatMessage, MessageType, SearchResult } from "@/types";
import { create } from "zustand";

type MessageStore = {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
};

type StoreState = MessageStore;

const useStore = create<StoreState>((set) => ({
  searchResults: [],
  messages: [
    // {
    //   role: MessageType.USER,
    //   content: "Hello!",
    // },
    // {
    //   role: MessageType.ASSISTANT,
    //   content: "Hello!",
    // },
  ],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));

export const useMessageStore = () =>
  useStore((state) => ({
    messages: state.messages,
    addMessage: state.addMessage,
  }));
