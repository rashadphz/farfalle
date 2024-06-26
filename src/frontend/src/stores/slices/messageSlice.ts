import { create, StateCreator } from "zustand";
import { ChatMessage } from "@/types";

type State = {
  threadId: number | null;
  messages: ChatMessage[];
};

type Actions = {
  addMessage: (message: ChatMessage) => void;
  setThreadId: (threadId: number | null) => void;
};

export type ChatStore = State & Actions;

export const createMessageSlice: StateCreator<ChatStore, [], [], ChatStore> = (
  set,
) => ({
  threadId: null,
  messages: [],
  addMessage: (message: ChatMessage) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setThreadId: (threadId: number | null) => set((state) => ({ threadId })),
});
