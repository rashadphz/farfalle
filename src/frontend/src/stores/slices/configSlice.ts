import { env } from "@/env.mjs";
import { StateCreator } from "zustand";
import { ChatModel } from "../../../generated";

type State = {
  model: ChatModel;
  localMode: boolean;
};

type Actions = {
  setModel: (model: ChatModel) => void;
  toggleLocalMode: () => void;
};

export type ConfigStore = State & Actions;

export const createConfigSlice: StateCreator<
  ConfigStore,
  [],
  [],
  ConfigStore
> = (set) => ({
  model: ChatModel.GPT_3_5_TURBO,
  localMode: false,
  setModel: (model: ChatModel) => set({ model }),
  toggleLocalMode: () =>
    set((state) => {
      const localModeEnabled = env.NEXT_PUBLIC_LOCAL_MODE_ENABLED;
      if (!localModeEnabled) {
        return { ...state, localMode: false };
      }

      const newLocalMode = !state.localMode;
      const newModel = newLocalMode
        ? ChatModel.LLAMA3
        : ChatModel.GPT_3_5_TURBO;
      return { localMode: newLocalMode, model: newModel };
    }),
});
