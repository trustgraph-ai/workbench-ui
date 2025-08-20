import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSocket } from "../socket";
import { renderHook } from "@testing-library/react";
import React from "react";

// Mock the settings hook
vi.mock("../../state/settings", () => ({
  useSettings: vi.fn(() => ({
    settings: {
      authentication: {
        apiKey: "test-api-key",
      },
    },
    isLoaded: true,
  })),
}));

// Mock socket instance
const mockSocket = {
  textCompletion: vi.fn(),
  graphRag: vi
    .fn()
    .mockImplementation(() => Promise.resolve("mock response")),
  agent: vi.fn(),
  embeddings: vi.fn(),
  graphEmbeddingsQuery: vi.fn(),
  triplesQuery: vi.fn(),
  loadDocument: vi.fn(),
  loadText: vi.fn(),
  loadLibraryDocument: vi.fn(),
  close: vi.fn(),
};

// Mock the trustgraph socket creation
vi.mock("../trustgraph-socket", () => ({
  createTrustGraphSocket: vi.fn(() => mockSocket),
}));

// Mock React with proper createContext support
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof React>();
  return {
    ...actual,
    createContext: vi.fn(() => ({
      Provider: ({ children }: { children: React.ReactNode }) =>
        React.createElement(
          "div",
          { "data-testid": "socket-provider" },
          children,
        ),
      Consumer: ({
        children,
      }: {
        children: (value: unknown) => React.ReactNode;
      }) => children(mockSocket),
    })),
    useContext: vi.fn(() => mockSocket),
  };
});

describe("useSocket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return socket context", () => {
    const { result } = renderHook(() => useSocket());

    expect(result.current).toBe(mockSocket);
  });

  it("should provide all required socket methods", () => {
    const { result } = renderHook(() => useSocket());

    const requiredMethods = [
      "textCompletion",
      "graphRag",
      "agent",
      "embeddings",
      "graphEmbeddingsQuery",
      "triplesQuery",
      "loadDocument",
      "loadText",
      "loadLibraryDocument",
      "close",
    ];

    requiredMethods.forEach((method) => {
      expect(result.current[method]).toBeDefined();
      expect(typeof result.current[method]).toBe("function");
    });
  });

  it("should maintain reference stability", () => {
    const { result, rerender } = renderHook(() => useSocket());

    const firstResult = result.current;

    rerender();

    expect(result.current).toBe(firstResult);
  });
});
