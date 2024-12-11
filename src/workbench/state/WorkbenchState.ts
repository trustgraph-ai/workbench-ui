
import { create } from 'zustand'
import { Message } from './Message';

export interface WorkbenchState {

    messages : Message[];
    input : string;

    working : number;

    setMessages : (v : Message[]) => void;
    addMessage : (role : string, text : string) => void;
    setInput : (v : string) => void;

    incWorking : (v : boolean) => void;
    decWorking : (v : boolean) => void;

}

export const useWorkbenchStateStore = create<WorkbenchState>()(

    (set) => ({

        messages: [
            {
                role: "ai",
                text: "Hello and welcome!",
            },
        ],

        input: "",

        working: 0,

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

        incWorking: (v) => set((state) => ({
	    working: state.working + 1,
	})),

        decWorking: (v) => set((state) => ({
	    working: state.working - 1,
	})),

    })

);

