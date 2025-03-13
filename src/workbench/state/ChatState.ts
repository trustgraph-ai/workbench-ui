
import { create } from 'zustand'
import { Message } from './Message';

export interface ChatState {

    messages : Message[];
    input : string;

    setMessages : (v : Message[]) => void;
    addMessage : (role : string, text : string) => void;
    setInput : (v : string) => void;

}

export const useChatStateStore = create<ChatState>()(

    (set) => ({

        messages: [
            {
                role: "ai",
                text: "Welcome to the TrustGraph Test Suite. Use the chat interface to perform Graph RAG requests."
            },
        ],

        input: "",

        setMessages: (v) => set(() => ({
	    messages: v,
	})),

        addMessage: (role: string, text : string) => set((state) => ({
	    messages: [
                ...state.messages, 
                {
                    role: role,
                    text: text,
                }
            ]
	})),

        setInput: (v) => set(() => ({
	    input: v,
	})),

    })

);

