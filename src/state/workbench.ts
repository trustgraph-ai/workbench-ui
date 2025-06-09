// Zustand state management library for creating stores
import { create } from "zustand";
// Entity interface definition for knowledge graph entities
import { Entity } from "./Entity";

/**
 * State interface for the main workbench/workspace application
 * Manages the current tool selection, entity selection, and available entities
 */
export interface WorkbenchState {
  // Currently selected entity in the knowledge graph (optional)
  selected?: Entity;
  // Currently active tool/page (e.g., "chat", "graph", "search", etc.)
  tool: string;
  // List of all available entities in the current context
  entities: Entity[];

  // Entity selection management
  setSelected: (e: Entity) => void; // Select a specific entity
  unsetSelected: () => void; // Clear the current entity selection

  // Tool/page navigation
  setTool: (v: string) => void; // Switch to a different tool/page

  // Entity list management
  setEntities: (ents: Entity[]) => void; // Update the available entities list
}

/**
 * Zustand store for managing the main workbench application state
 * Provides centralized state management for tool navigation and entity selection
 */
export const useWorkbenchStateStore = create<WorkbenchState>()((set) => ({
  // Initial state values
  selected: undefined, // No entity selected by default

  tool: "chat", // Default tool is the chat interface

  entities: [], // Empty entities list by default

  // Entity selection functions
  setSelected: (e: Entity) =>
    set(() => ({
      selected: e,
    })),

  // Clear the current entity selection
  unsetSelected: () =>
    set(() => ({
      selected: undefined,
    })),

  // Tool/page navigation function
  setTool: (v) =>
    set(() => ({
      tool: v,
    })),

  // Update the list of available entities
  setEntities: (v) =>
    set(() => ({
      entities: v,
    })),
}));
