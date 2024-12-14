
import { create } from 'zustand'
import { Message } from './Message';
import { Entity } from './Entity';

export interface WorkbenchState {

    messages : Message[];
    input : string;
    working : number;
    selected? : Entity;
    tool : string;
    entities : Entity[];

    setMessages : (v : Message[]) => void;
    addMessage : (role : string, text : string) => void;
    setInput : (v : string) => void;

    incWorking : () => void;
    decWorking : () => void;

    setSelected : (e : Entity) => void;
    unsetSelected : () => void;

    setTool : (v : string) => void;
    setEntities : (ents : Entities[]) => void;

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

        selected : undefined,

        tool : "chat",

        entities : [],

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

        incWorking: () => set((state) => ({
	    working: state.working + 1,
	})),

        decWorking: () => set((state) => ({
	    working: state.working - 1,
	})),

        setSelected: (e : Entity) => set(() => ({
            selected: e,
        })),

        unsetSelected: () => set(() => ({
            selected: undefined,
        })),

        setTool: (v) => set(() => ({
            tool: v,
        })),

        setEntities: (v) => set(() => ({
            entities: v,
        })),

    })

);

