
import { create } from 'zustand'

export interface Argument {
    name : string;
    type : string;
    description : string;
};

export interface Tool {
    id : string;
    name : string;
    type : string;
    description : string;
    config : { [key : string] : string };
    arguments : Argument[];
};

export interface Agents {

    tools : Tool[];

    setTools : (v : Tool[]) => void;

};

export const useAgentsStore = create<Agents>()(

    (set) => ({

        tools: [
            {
                id: "sample-query",
                name: "Sample query",
                type: "knowledge-query",
                config: {},
                description: "Query a knowledge base that has already been extracted.  The query should be a simple natural language question.",
                arguments: [
                    {
                        name: "query",
                        type: "string",
                        description: "Describe the search query here.",
                    }
                ]
            },
            {
                id: "sample-completion",
                name: "Sample text completion",
                type: "text-completion",
                config: {},
                description: "Describe the request to send to LLM. This request will be sent with no additional context.",
                arguments: [
                    {
                        name: "response",
                        type: "string",
                        description: "The response expected from the LLM.",
                    }
                ]
            }
        ],

        setTools: (v) => set(() => ({
	    tools: v
	})),

    })

);

