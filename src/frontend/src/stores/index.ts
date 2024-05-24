import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ConfigStore, createConfigSlice } from "./slices/configSlice";
import { createMessageSlice, MessageStore } from "./slices/messageSlice";

type StoreState = MessageStore & ConfigStore;

const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createMessageSlice(...a),
      ...createConfigSlice(...a),
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
  }));

export const useConfigStore = () =>
  useStore((state) => ({
    localMode: state.localMode,
    toggleLocalMode: state.toggleLocalMode,
    model: state.model,
    setModel: state.setModel,
  }));
