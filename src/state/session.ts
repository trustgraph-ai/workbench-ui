import { create } from "zustand";

export interface SessionState {
  flow: string;
  flowDescription: string;

  setFlow: (v: string) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  flowId: "default",
  flow: null,

  setFlowId: (v) =>
    set(() => ({
      flowId: v,
    })),

  setFlow: (v) =>
    set(() => ({
      flow: v,
    })),
}));
