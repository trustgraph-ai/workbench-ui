import { create } from "zustand";

// Interface defining the shape of the session state store
export interface SessionState {
  // Current flow name/type (string)
  flow: string;

  // Description of the current flow
  flowDescription: string;

  // Function to update the current flow
  setFlow: (v: string) => void;
}

// Zustand store for managing session/workflow state
// WARNING: There's a mismatch between the interface and implementation
export const useSessionStore = create<SessionState>()((set) => ({
  // MISMATCH: Interface expects 'flow: string' but implementation has
  // 'flowId: string'
  flowId: "default", // This property doesn't exist in the interface

  // MISMATCH: Interface expects 'flow: string' but implementation has
  // 'flow: null'
  flow: null, // This should be a string according to the interface

  // MISSING: Interface defines 'flowDescription' but it's not implemented

  // EXTRA: This setter doesn't exist in the interface
  setFlowId: (v) =>
    set(() => ({
      flowId: v,
    })),

  // This setter matches the interface
  setFlow: (v) =>
    set(() => ({
      flow: v,
    })),
}));
