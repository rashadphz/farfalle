import { ChatMessage } from "@/types";
import { create } from "zustand";
import { ChatModel } from "../generated";

type MessageStore = {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  model: ChatModel;
  setModel: (model: ChatModel) => void;
};

type ConfigStore = {
  localMode: boolean;
  toggleLocalMode: () => void;
};

type StoreState = MessageStore & ConfigStore;

const useStore = create<StoreState>((set) => ({
  searchResults: [],
  messages: [],
  model: ChatModel.GPT_3_5_TURBO,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setModel: (model) => set({ model }),

  localMode: false,
  toggleLocalMode: () =>
    set((state) => {
      const newLocalMode = !state.localMode;
      const newModel = newLocalMode
        ? ChatModel.LLAMA3
        : ChatModel.GPT_3_5_TURBO;
      return { localMode: newLocalMode, model: newModel };
    }),
}));

export const useMessageStore = () =>
  useStore((state) => ({
    messages: state.messages,
    addMessage: state.addMessage,
    model: state.model,
    setModel: state.setModel,
  }));

export const useConfigStore = () =>
  useStore((state) => ({
    localMode: state.localMode,
    toggleLocalMode: state.toggleLocalMode,
  }));
