import { ChatMessage } from "@/types";
import { create } from "zustand";
import { ChatModel } from "../generated";
import { env } from "./env.mjs";
import { persist } from "zustand/middleware";

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

const useStore = create<StoreState>()(
  persist(
    (set) => ({
      searchResults: [],
      messages: [],
      model: ChatModel.GPT_3_5_TURBO,
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      setModel: (model) => set({ model }),

      localMode: false,
      toggleLocalMode: () =>
        set((state) => {
          const localModeEnabled = env.NEXT_PUBLIC_LOCAL_MODE_ENABLED;
          if (!localModeEnabled) {
            return { localMode: false };
          }

          const newLocalMode = !state.localMode;
          const newModel = newLocalMode
            ? ChatModel.LLAMA3
            : ChatModel.GPT_3_5_TURBO;
          return { localMode: newLocalMode, model: newModel };
        }),
    }),
    {
      name: "store",
      partialize: (state) => ({
        model: state.model,
        localMode: state.localMode,
      }),
    },
  ),
);

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
