import { describe, it, expect, vi } from "vitest";
import { useSocket } from "../socket";
import { renderHook } from "@testing-library/react";

// Mock the SocketContext
vi.mock("../SocketContext", () => ({
  SocketContext: {
    _currentValue: null,
    Provider: ({ children }: any) => children,
    Consumer: ({ children }: any) => children(null),
  },
}));

// Mock React useContext to return a mock socket
const mockSocketContext = {
  textCompletion: vi.fn(),
  graphRag: vi.fn().mockImplementation((text: string, options?: any) => 
    Promise.resolve("mock response")
  ),
  agent: vi.fn(),
  embeddings: vi.fn(),
  graphEmbeddingsQuery: vi.fn(),
  triplesQuery: vi.fn(),
  loadDocument: vi.fn(),
  loadText: vi.fn(),
  loadLibraryDocument: vi.fn(),
  close: vi.fn(),
};

vi.mock("react", () => ({
  useContext: vi.fn(() => mockSocketContext),
}));

describe("useSocket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return socket context", () => {
    const { result } = renderHook(() => useSocket());

    expect(result.current).toBe(mockSocketContext);
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
