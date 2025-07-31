import { create } from "zustand";
import { Row } from "./row";

// Interface defining the shape of the search state store
export interface SearchState {
  // Array of Row objects representing search results or filtered data
  rows: Row[];

  // Function to update the entire rows array (replaces all results)
  setRows: (v: Row[]) => void;

  // Current search input/query string from user
  input: string;

  // Function to update the search input value
  setInput: (v: string) => void;
}

// Zustand store for managing search functionality state
export const useSearchStateStore = create<SearchState>()((set) => ({
  // Initial state: no search results and empty search input
  rows: [],
  input: "",

  // Replace the entire rows array with new search results
  // Note: This completely overwrites the previous results
  setRows: (v) =>
    set(() => ({
      rows: v,
    })),

  // Update the search input string (typically bound to search input field)
  setInput: (v) =>
    set(() => ({
      input: v,
    })),
}));
