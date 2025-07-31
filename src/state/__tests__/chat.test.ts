import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChatStateStore } from "../chat";

describe("useChatStateStore", () => {
  beforeEach(() => {
    // Reset the store before each test
    useChatStateStore.getState().setMessages([
      {
        role: "ai",
        text: "Welcome to the TrustGraph Test Suite. Use the chat interface to perform Graph RAG requests.",
      },
    ]);
    useChatStateStore.getState().setInput("");
    useChatStateStore.getState().setChatMode("graph-rag");
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useChatStateStore());

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toEqual({
      role: "ai",
      text: "Welcome to the TrustGraph Test Suite. Use the chat interface to perform Graph RAG requests.",
    });
    expect(result.current.input).toBe("");
    expect(result.current.chatMode).toBe("graph-rag");
  });

  it("should set messages", () => {
    const { result } = renderHook(() => useChatStateStore());

    const newMessages = [
      { role: "user", text: "Hello" },
      { role: "ai", text: "Hi there!" },
    ];

    act(() => {
      result.current.setMessages(newMessages);
    });

    expect(result.current.messages).toEqual(newMessages);
  });

  it("should add message with default type", () => {
    const { result } = renderHook(() => useChatStateStore());

    act(() => {
      result.current.addMessage("user", "Test message");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]).toEqual({
      role: "user",
      text: "Test message",
      type: "normal",
    });
  });

  it("should add message with specific type", () => {
    const { result } = renderHook(() => useChatStateStore());

    act(() => {
      result.current.addMessage("ai", "Thinking...", "thinking");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]).toEqual({
      role: "ai",
      text: "Thinking...",
      type: "thinking",
    });
  });

  it("should add multiple messages in sequence", () => {
    const { result } = renderHook(() => useChatStateStore());

    act(() => {
      result.current.addMessage("user", "First message");
      result.current.addMessage("ai", "First response");
      result.current.addMessage("user", "Second message");
    });

    expect(result.current.messages).toHaveLength(4);
    expect(result.current.messages[1].text).toBe("First message");
    expect(result.current.messages[2].text).toBe("First response");
    expect(result.current.messages[3].text).toBe("Second message");
  });

  it("should set input value", () => {
    const { result } = renderHook(() => useChatStateStore());

    act(() => {
      result.current.setInput("Test input");
    });

    expect(result.current.input).toBe("Test input");
  });

  it("should update input value", () => {
    const { result } = renderHook(() => useChatStateStore());

    act(() => {
      result.current.setInput("Initial input");
    });

    act(() => {
      result.current.setInput("Updated input");
    });

    expect(result.current.input).toBe("Updated input");
  });

  it("should set chat mode", () => {
    const { result } = renderHook(() => useChatStateStore());

    act(() => {
      result.current.setChatMode("agent");
    });

    expect(result.current.chatMode).toBe("agent");
  });

  it("should change chat mode from graph-rag to basic-llm", () => {
    const { result } = renderHook(() => useChatStateStore());

    expect(result.current.chatMode).toBe("graph-rag");

    act(() => {
      result.current.setChatMode("basic-llm");
    });

    expect(result.current.chatMode).toBe("basic-llm");
  });

  it("should handle all message types", () => {
    const { result } = renderHook(() => useChatStateStore());

    const messageTypes = [
      "normal",
      "thinking",
      "observation",
      "answer",
    ] as const;

    messageTypes.forEach((type, index) => {
      act(() => {
        result.current.addMessage("ai", `Message ${index}`, type);
      });
    });

    expect(result.current.messages).toHaveLength(5); // 1 initial + 4 added

    messageTypes.forEach((type, index) => {
      expect(result.current.messages[index + 1].type).toBe(type);
    });
  });

  it("should handle empty message text", () => {
    const { result } = renderHook(() => useChatStateStore());

    act(() => {
      result.current.addMessage("user", "");
    });

    expect(result.current.messages[1].text).toBe("");
    expect(result.current.messages[1].role).toBe("user");
  });

  it("should preserve message order", () => {
    const { result } = renderHook(() => useChatStateStore());

    const messages = [
      { role: "user", text: "Question 1" },
      { role: "ai", text: "Answer 1" },
      { role: "user", text: "Question 2" },
      { role: "ai", text: "Answer 2" },
    ];

    messages.forEach((msg) => {
      act(() => {
        result.current.addMessage(msg.role, msg.text);
      });
    });

    expect(result.current.messages).toHaveLength(5); // 1 initial + 4 added

    messages.forEach((msg, index) => {
      expect(result.current.messages[index + 1].text).toBe(msg.text);
      expect(result.current.messages[index + 1].role).toBe(msg.role);
    });
  });
});
