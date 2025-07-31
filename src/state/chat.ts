import { create } from "zustand";
import { Message } from "../model/message";

export type ChatMode = "graph-rag" | "agent" | "basic-llm";

export interface ChatState {
  messages: Message[];
  input: string;
  chatMode: ChatMode;

  setMessages: (v: Message[]) => void;
  addMessage: (
    role: string,
    text: string,
    type?: "normal" | "thinking" | "observation" | "answer",
  ) => void;
  setInput: (v: string) => void;
  setChatMode: (mode: ChatMode) => void;
}

export const useChatStateStore = create<ChatState>()((set) => ({
  messages: [
    {
      role: "ai",
      text: "Welcome to the TrustGraph Test Suite. Use the chat interface to perform Graph RAG requests.",
    },
  ],

  input: "",
  chatMode: "graph-rag",

  setMessages: (v) =>
    set(() => ({
      messages: v,
    })),

  addMessage: (
    role: string,
    text: string,
    type?: "normal" | "thinking" | "observation" | "answer",
  ) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          role: role,
          text: text,
          type: type || "normal",
        },
      ],
    })),

  setInput: (v) =>
    set(() => ({
      input: v,
    })),

  setChatMode: (mode: ChatMode) =>
    set(() => ({
      chatMode: mode,
    })),
}));
