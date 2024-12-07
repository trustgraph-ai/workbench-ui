
import { create } from 'zustand'

import * as prompts from '../prompts';

export interface Prompt {
    id : string;
    name : string;
    prompt : string;
    custom : boolean;
};

export interface Prompts {

    prompts : Prompt[];

    setPrompts : (v : Prompt[]) => void;

};

export const usePromptsStore = create<Prompts>()(

    (set) => ({

        prompts: [
            {
                id: "system-template",
                name: "LLM System",
                prompt: prompts.default_system_prompt,
                custom: false,
            },
            {
                id: "extract-definitions",
                name: "Extract Definitions",
                prompt: prompts.default_definition_prompt,
                custom: false,
            },
            {
                id: "extract-relationships",
                name: "Extract Relationships",
                prompt: prompts.default_relationship_prompt,
                custom: false,
            },
            {
                id: "extract-topics",
                name: "Extract Topics",
                prompt: prompts.default_topics_prompt,
                custom: false,
            },
            {
                id: "extract-rows",
                name: "Extract Rows",
                prompt: prompts.default_rows_prompt,
                custom: false,
            },
            {
                id: "kg-prompt",
                name: "Knowledge Graph Query",
                prompt: prompts.default_knowledge_query_prompt,
                custom: false,
            },
            {
                id: "document-prompt",
                name: "Document Query",
                prompt: prompts.default_document_query_prompt,
                custom: false,
            },
            {
                id: "agent-react",
                name: "ReAct Agent Router",
                prompt: prompts.default_agent_react_prompt,
                custom: false,
            },
        ],

        setPrompts: (v) => set(() => ({
	    prompts: v
	})),

    })

);

