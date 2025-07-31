// Zustand state management library for creating stores
import { create } from "zustand";

/**
 * State interface for managing document loading and upload operations
 * Handles file uploads, text input, metadata, and processing operations
 */
export interface LoadState {
  // Document metadata
  title: string; // Document title/name
  comments: string; // Additional comments or description
  url: string; // Source URL (for web-based content)
  keywords: string[]; // Keywords/tags associated with the document

  // Processing configuration
  operation: string; // Type of operation (e.g., "upload-pdf", "upload-text")

  // File management
  files: File[]; // Files selected for upload
  uploaded: string[]; // List of successfully uploaded file names
  text: string; // Direct text input content

  // State update functions for document metadata
  setTitle: (v: string) => void;
  setComments: (v: string) => void;
  setUrl: (v: string) => void;
  setKeywords: (v: string[]) => void;

  // State update functions for processing
  setOperation: (v: string) => void;

  // State update functions for file management
  setFiles: (v: File[]) => void;
  setUploaded: (v: string[]) => void;
  setText: (v: string) => void;
  addUploaded: (v: string) => void; // Add a single uploaded file to the list
  removeFile: (v: File) => void; // Remove a file from the selection

  // Text upload tracking
  textUploads: number; // Counter for text-based uploads
  setTextUploads: (v: number) => void;
  incTextUploads: () => void; // Increment the text upload counter
}

/**
 * Zustand store for managing document loading state
 * Provides centralized state management for the document upload/loading workflow
 */
export const useLoadStateStore = create<LoadState>()((set) => ({
  // Initial state values
  title: "", // Empty title by default
  comments: "", // Empty comments by default
  url: "", // Empty URL by default
  keywords: [], // No keywords by default
  operation: "upload-pdf", // Default operation is PDF upload
  files: [], // No files selected by default
  uploaded: [], // No files uploaded yet
  text: "", // Empty text content by default

  // Setter functions for document metadata
  setTitle: (v) =>
    set(() => ({
      title: v,
    })),

  setComments: (v) =>
    set(() => ({
      comments: v,
    })),

  setUrl: (v) =>
    set(() => ({
      url: v,
    })),

  setKeywords: (v) =>
    set(() => ({
      keywords: v,
    })),

  // Setter function for processing operation type
  setOperation: (v) =>
    set(() => ({
      operation: v,
    })),

  // Setter functions for file management
  setFiles: (v) =>
    set(() => ({
      files: v,
    })),

  setUploaded: (v) =>
    set(() => ({
      uploaded: v,
    })),

  // Add a single file to the uploaded list (preserving existing uploads)
  addUploaded: (v) =>
    set((state) => ({
      uploaded: [...state.uploaded, v],
    })),

  setText: (v) =>
    set(() => ({
      text: v,
    })),

  // Remove a specific file from the selected files list
  removeFile: (v) =>
    set((state) => ({
      files: Array.from(state.files).filter((f) => f != v),
    })),

  // Text upload counter management
  textUploads: 0, // Initial counter value
  setTextUploads: (v) =>
    set(() => ({
      textUploads: v,
    })),
  // Increment the text upload counter (useful for generating unique IDs)
  incTextUploads: () =>
    set((state) => ({
      textUploads: state.textUploads + 1,
    })),
}));
