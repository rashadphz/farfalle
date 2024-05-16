import { ChatMessage, MessageType, SearchResult } from "@/types";
import { create } from "zustand";
import { ChatModel } from "../generated";

type MessageStore = {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  model: ChatModel;
  setModel: (model: ChatModel) => void;
};

type StoreState = MessageStore;

const useStore = create<StoreState>((set) => ({
  searchResults: [],
  messages: [],
  model: ChatModel.GPT_3_5_TURBO,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setModel: (model) => set({ model }),
}));

export const useMessageStore = () =>
  useStore((state) => ({
    messages: state.messages,
    addMessage: state.addMessage,
    model: state.model,
    setModel: state.setModel,
  }));
