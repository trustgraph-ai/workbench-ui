import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProgressStateStore } from "../progress";

describe("useProgressStateStore", () => {
  beforeEach(() => {
    // Reset the store before each test
    useProgressStateStore.setState({
      activity: new Set<string>([]),
      error: "",
      addActivity: useProgressStateStore.getState().addActivity,
      removeActivity: useProgressStateStore.getState().removeActivity,
      setError: useProgressStateStore.getState().setError,
    });
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useProgressStateStore());

    expect(result.current.activity.size).toBe(0);
    expect(result.current.error).toBe("");
  });

  it("should add activity", () => {
    const { result } = renderHook(() => useProgressStateStore());

    act(() => {
      result.current.addActivity("test-activity");
    });

    expect(result.current.activity.has("test-activity")).toBe(true);
    expect(result.current.activity.size).toBe(1);
  });

  it("should add multiple activities", () => {
    const { result } = renderHook(() => useProgressStateStore());

    act(() => {
      result.current.addActivity("activity-1");
      result.current.addActivity("activity-2");
      result.current.addActivity("activity-3");
    });

    expect(result.current.activity.size).toBe(3);
    expect(result.current.activity.has("activity-1")).toBe(true);
    expect(result.current.activity.has("activity-2")).toBe(true);
    expect(result.current.activity.has("activity-3")).toBe(true);
  });

  it("should not add duplicate activities", () => {
    const { result } = renderHook(() => useProgressStateStore());

    act(() => {
      result.current.addActivity("duplicate-activity");
      result.current.addActivity("duplicate-activity");
      result.current.addActivity("duplicate-activity");
    });

    expect(result.current.activity.size).toBe(1);
    expect(result.current.activity.has("duplicate-activity")).toBe(true);
  });

  it("should remove activity", () => {
    const { result } = renderHook(() => useProgressStateStore());

    act(() => {
      result.current.addActivity("test-activity");
    });

    expect(result.current.activity.has("test-activity")).toBe(true);

    act(() => {
      result.current.removeActivity("test-activity");
    });

    expect(result.current.activity.has("test-activity")).toBe(false);
    expect(result.current.activity.size).toBe(0);
  });

  it("should handle removing non-existent activity", () => {
    const { result } = renderHook(() => useProgressStateStore());

    act(() => {
      result.current.removeActivity("non-existent-activity");
    });

    expect(result.current.activity.size).toBe(0);
  });

  it("should remove specific activity without affecting others", () => {
    const { result } = renderHook(() => useProgressStateStore());

    act(() => {
      result.current.addActivity("activity-1");
      result.current.addActivity("activity-2");
      result.current.addActivity("activity-3");
    });

    expect(result.current.activity.size).toBe(3);

    act(() => {
      result.current.removeActivity("activity-2");
    });

    expect(result.current.activity.size).toBe(2);
    expect(result.current.activity.has("activity-1")).toBe(true);
    expect(result.current.activity.has("activity-2")).toBe(false);
    expect(result.current.activity.has("activity-3")).toBe(true);
  });

  it("should set error message", () => {
    const { result } = renderHook(() => useProgressStateStore());

    act(() => {
      result.current.setError("Test error message");
    });

    expect(result.current.error).toBe("Test error message");
  });

  it("should update error message", () => {
    const { result } = renderHook(() => useProgressStateStore());

    act(() => {
      result.current.setError("Initial error");
    });
    expect(result.current.error).toBe("Initial error");

    act(() => {
      result.current.setError("Updated error");
    });
    expect(result.current.error).toBe("Updated error");
  });

  it("should clear error message", () => {
    const { result } = renderHook(() => useProgressStateStore());

    act(() => {
      result.current.setError("Some error");
    });
    expect(result.current.error).toBe("Some error");

    act(() => {
      result.current.setError("");
    });
    expect(result.current.error).toBe("");
  });

  it("should handle empty string activity", () => {
    const { result } = renderHook(() => useProgressStateStore());

    act(() => {
      result.current.addActivity("");
    });

    expect(result.current.activity.has("")).toBe(true);
    expect(result.current.activity.size).toBe(1);
  });

  it("should maintain immutability for activities", () => {
    const { result } = renderHook(() => useProgressStateStore());

    act(() => {
      result.current.addActivity("test-activity");
    });

    const firstActivitySet = result.current.activity;

    act(() => {
      result.current.addActivity("another-activity");
    });

    const secondActivitySet = result.current.activity;

    // Should be different Set instances (immutability)
    expect(firstActivitySet).not.toBe(secondActivitySet);
    expect(firstActivitySet.size).toBe(1);
    expect(secondActivitySet.size).toBe(2);
  });

  it("should handle concurrent add and remove operations", () => {
    const { result } = renderHook(() => useProgressStateStore());

    act(() => {
      result.current.addActivity("activity-1");
      result.current.addActivity("activity-2");
      result.current.removeActivity("activity-1");
      result.current.addActivity("activity-3");
    });

    expect(result.current.activity.size).toBe(2);
    expect(result.current.activity.has("activity-1")).toBe(false);
    expect(result.current.activity.has("activity-2")).toBe(true);
    expect(result.current.activity.has("activity-3")).toBe(true);
  });

  it("should handle long activity names", () => {
    const { result } = renderHook(() => useProgressStateStore());

    const longActivityName = "a".repeat(1000);

    act(() => {
      result.current.addActivity(longActivityName);
    });

    expect(result.current.activity.has(longActivityName)).toBe(true);
    expect(result.current.activity.size).toBe(1);
  });

  it("should handle special characters in activity names", () => {
    const { result } = renderHook(() => useProgressStateStore());

    const specialActivity =
      "activity-with-special-chars!@#$%^&*()_+{}[]|\\:;\"'<>,.?/~`";

    act(() => {
      result.current.addActivity(specialActivity);
    });

    expect(result.current.activity.has(specialActivity)).toBe(true);
    expect(result.current.activity.size).toBe(1);
  });
});
