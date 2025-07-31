import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSessionStore } from "../session";

describe("useSessionStore", () => {
  beforeEach(() => {
    // Reset the store before each test
    useSessionStore.setState({
      flowId: "default",
      flow: null,
      setFlowId: useSessionStore.getState().setFlowId,
      setFlow: useSessionStore.getState().setFlow,
    });
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useSessionStore());

    expect(result.current.flowId).toBe("default");
    expect(result.current.flow).toBeNull();
  });

  it("should set flow ID", () => {
    const { result } = renderHook(() => useSessionStore());

    act(() => {
      result.current.setFlowId("custom-flow");
    });

    expect(result.current.flowId).toBe("custom-flow");
  });

  it("should set flow", () => {
    const { result } = renderHook(() => useSessionStore());

    const mockFlow = {
      id: "test-flow",
      name: "Test Flow",
      description: "A test flow",
    };

    act(() => {
      result.current.setFlow(mockFlow);
    });

    expect(result.current.flow).toEqual(mockFlow);
  });

  it("should update flow ID multiple times", () => {
    const { result } = renderHook(() => useSessionStore());

    act(() => {
      result.current.setFlowId("flow-1");
    });
    expect(result.current.flowId).toBe("flow-1");

    act(() => {
      result.current.setFlowId("flow-2");
    });
    expect(result.current.flowId).toBe("flow-2");
  });

  it("should update flow multiple times", () => {
    const { result } = renderHook(() => useSessionStore());

    const flow1 = { id: "flow-1", name: "Flow 1" };
    const flow2 = { id: "flow-2", name: "Flow 2" };

    act(() => {
      result.current.setFlow(flow1);
    });
    expect(result.current.flow).toEqual(flow1);

    act(() => {
      result.current.setFlow(flow2);
    });
    expect(result.current.flow).toEqual(flow2);
  });

  it("should handle empty string flow ID", () => {
    const { result } = renderHook(() => useSessionStore());

    act(() => {
      result.current.setFlowId("");
    });

    expect(result.current.flowId).toBe("");
  });

  it("should handle null flow", () => {
    const { result } = renderHook(() => useSessionStore());

    const mockFlow = { id: "test" };

    act(() => {
      result.current.setFlow(mockFlow);
    });
    expect(result.current.flow).toEqual(mockFlow);

    act(() => {
      result.current.setFlow(null);
    });
    expect(result.current.flow).toBeNull();
  });

  it("should handle undefined flow", () => {
    const { result } = renderHook(() => useSessionStore());

    act(() => {
      result.current.setFlow(undefined);
    });

    expect(result.current.flow).toBeUndefined();
  });

  it("should maintain independent state for flow and flowId", () => {
    const { result } = renderHook(() => useSessionStore());

    const mockFlow = { id: "test-flow", name: "Test Flow" };

    act(() => {
      result.current.setFlowId("different-id");
      result.current.setFlow(mockFlow);
    });

    expect(result.current.flowId).toBe("different-id");
    expect(result.current.flow).toEqual(mockFlow);
  });

  it("should handle complex flow objects", () => {
    const { result } = renderHook(() => useSessionStore());

    const complexFlow = {
      id: "complex-flow",
      name: "Complex Flow",
      description: "A complex flow with multiple properties",
      steps: [
        { id: "step1", name: "First Step" },
        { id: "step2", name: "Second Step" },
      ],
      metadata: {
        version: "1.0",
        author: "Test Author",
      },
    };

    act(() => {
      result.current.setFlow(complexFlow);
    });

    expect(result.current.flow).toEqual(complexFlow);
  });
});
