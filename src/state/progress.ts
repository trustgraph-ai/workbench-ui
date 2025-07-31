import { create } from "zustand";

// Interface defining the shape of the progress state store
export interface ProgressState {
  // Set of active activity identifiers - using Set for O(1) lookups and
  // automatic deduplication
  activity: Set<string>;

  // Current error message, empty string when no error
  error: string;

  // Function to add a new activity to the tracking set
  addActivity: (act: string) => void;

  // Function to remove an activity from the tracking set
  removeActivity: (act: string) => void;

  // Function to set/update the current error message
  setError: (error: string) => void;
}

// Zustand store for managing progress/loading states and errors across the
// application
export const useProgressStateStore = create<ProgressState>()((set) => ({
  // Initial state: empty activity set and no error
  activity: new Set<string>([]),
  error: "",

  // Add an activity identifier to track ongoing operations
  addActivity: (act) =>
    set((state) => {
      // Create a new Set to maintain immutability (Zustand best practice)
      const n = new Set(state.activity);
      n.add(act);
      return {
        ...state,
        activity: n,
      };
    }),

  // Remove an activity identifier when operation completes
  removeActivity: (act) =>
    set((state) => {
      // Create a new Set to maintain immutability
      const n = new Set(state.activity);
      n.delete(act);
      return {
        ...state,
        activity: n,
      };
    }),

  // Update the error state (pass empty string to clear error)
  setError: (error) =>
    set((state) => {
      return {
        ...state,
        error: error,
      };
    }),
}));
