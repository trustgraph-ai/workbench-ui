import { create } from "zustand";

export interface SessionState {

  flow: string;

  setFlow: (v: string) => void;

}

export const useSessionStore = create<SessionState>()((set) => ({
  flow: "default",

  setFlow: (v) =>
    set(() => ({
      flow: v,
    })),

}));

