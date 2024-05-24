import { create, StateCreator } from "zustand";
import { ChatMessage } from "@/types";

type State = {
  messages: ChatMessage[];
};

type Actions = {
  addMessage: (message: ChatMessage) => void;
};

export type MessageStore = State & Actions;

export const createMessageSlice: StateCreator<
  MessageStore,
  [],
  [],
  MessageStore
> = (set) => ({
  messages: [],
  addMessage: (message: ChatMessage) =>
    set((state) => ({ messages: [...state.messages, message] })),
});
