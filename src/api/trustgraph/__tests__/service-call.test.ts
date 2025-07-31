import { describe, it, expect, vi, beforeEach } from "vitest";
import { ServiceCall, SOCKET_RECONNECTION_TIMEOUT } from "../service-call";

// Mock Socket interface
const mockSocket = {
  inflight: {},
  ws: {
    send: vi.fn(),
  },
  reopen: vi.fn(),
};

// Mock setTimeout and clearTimeout
const mockSetTimeout = vi.fn();
const mockClearTimeout = vi.fn();

vi.stubGlobal("setTimeout", mockSetTimeout);
vi.stubGlobal("clearTimeout", mockClearTimeout);

describe("ServiceCall", () => {
  let mockSuccess: ReturnType<typeof vi.fn>;
  let mockError: ReturnType<typeof vi.fn>;
  let serviceCall: ServiceCall;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSuccess = vi.fn();
    mockError = vi.fn();
    mockSocket.inflight = {};
    mockSocket.ws = {
      send: vi.fn(),
    };
    mockSocket.reopen.mockClear();

    serviceCall = new ServiceCall(
      "test-mid",
      { id: "test-id", service: "test-service", request: { test: "data" } },
      mockSuccess,
      mockError,
      5000, // 5 second timeout
      3, // 3 retries
      mockSocket as any,
    );
  });

  it("should initialize with correct properties", () => {
    expect(serviceCall.mid).toBe("test-mid");
    expect(serviceCall.timeout).toBe(5000);
    expect(serviceCall.retries).toBe(3);
    expect(serviceCall.complete).toBe(false);
    expect(serviceCall.socket).toBe(mockSocket);
  });

  it("should register itself in socket inflight when started", () => {
    serviceCall.start();

    expect(mockSocket.inflight["test-mid"]).toBe(serviceCall);
  });

  it("should send message on successful attempt", () => {
    serviceCall.start();

    expect(mockSocket.ws.send).toHaveBeenCalledWith(
      JSON.stringify({
        id: "test-id",
        service: "test-service",
        request: { test: "data" },
      }),
    );
    expect(mockSetTimeout).toHaveBeenCalled();
  });

  it("should handle successful response", () => {
    const response = { result: "success" };

    serviceCall.start();
    serviceCall.onReceived(response);

    expect(serviceCall.complete).toBe(true);
    expect(mockSuccess).toHaveBeenCalledWith(response);
    expect(mockClearTimeout).toHaveBeenCalled();
    expect(mockSocket.inflight["test-mid"]).toBeUndefined();
  });

  it("should handle timeout and retry", () => {
    serviceCall.start();

    // Initial retries should be 3, but start() calls attempt() which decrements to 2
    expect(serviceCall.retries).toBe(2);

    // Simulate timeout
    serviceCall.onTimeout();

    expect(mockClearTimeout).toHaveBeenCalled();
    expect(serviceCall.retries).toBe(1); // Should decrement from 2 to 1
  });

  it("should exhaust retries and call error callback", () => {
    // Set retries to 0 to force immediate failure
    serviceCall.retries = 0;

    serviceCall.start();

    expect(mockError).toHaveBeenCalledWith("Ran out of retries");
    expect(mockSocket.inflight["test-mid"]).toBeUndefined();
  });

  it("should handle WebSocket send failure", () => {
    mockSocket.ws.send.mockImplementation(() => {
      throw new Error("Connection failed");
    });

    serviceCall.start();

    expect(mockSocket.reopen).toHaveBeenCalled();
    expect(mockSetTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      SOCKET_RECONNECTION_TIMEOUT,
    );
  });

  it("should handle missing WebSocket connection", () => {
    mockSocket.ws = null;

    serviceCall.start();

    expect(mockSetTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      SOCKET_RECONNECTION_TIMEOUT,
    );
  });

  it("should not process response if already complete", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    serviceCall.complete = true;
    serviceCall.onReceived({ result: "test" });

    expect(consoleSpy).toHaveBeenCalledWith(
      "test-mid",
      "should not happen, request is already complete",
    );

    consoleSpy.mockRestore();
  });

  it("should not timeout if already complete", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    serviceCall.complete = true;
    serviceCall.onTimeout();

    expect(consoleSpy).toHaveBeenCalledWith(
      "test-mid",
      "timeout should not happen, request is already complete",
    );

    consoleSpy.mockRestore();
  });

  it("should not attempt if already complete", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    serviceCall.complete = true;
    serviceCall.attempt();

    expect(consoleSpy).toHaveBeenCalledWith(
      "test-mid",
      "attempt should not be called, request is already complete",
    );

    consoleSpy.mockRestore();
  });

  it("should handle multiple retries correctly", () => {
    mockSocket.ws.send.mockImplementation(() => {
      throw new Error("Connection failed");
    });

    serviceCall.start();

    // Should have decremented retries and scheduled a retry
    expect(serviceCall.retries).toBe(2);
    expect(mockSocket.reopen).toHaveBeenCalledTimes(1);
  });

  it("should clean up properly on successful response", () => {
    serviceCall.start();

    const response = { success: true };
    serviceCall.onReceived(response);

    expect(serviceCall.complete).toBe(true);
    expect(mockClearTimeout).toHaveBeenCalled();
    expect(mockSocket.inflight["test-mid"]).toBeUndefined();
    expect(mockSuccess).toHaveBeenCalledWith(response);
  });

  it("should handle edge case of negative retries", () => {
    serviceCall.retries = -1;

    serviceCall.attempt();

    expect(mockError).toHaveBeenCalledWith("Ran out of retries");
  });

  it("should bind timeout callbacks correctly", () => {
    serviceCall.start();

    // Verify that setTimeout was called with a bound function
    expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
  });
});
