
import { create } from 'zustand'
import { Entity } from './Entity';

export interface WorkbenchState {

    working : number;
    selected? : Entity;
    tool : string;
    entities : Entity[];

    incWorking : () => void;
    decWorking : () => void;

    setSelected : (e : Entity) => void;
    unsetSelected : () => void;

    setTool : (v : string) => void;
    setEntities : (ents : Entity[]) => void;

}

export const useWorkbenchStateStore = create<WorkbenchState>()(

    (set) => ({

        working: 0,

        selected : undefined,

        tool : "chat",

        entities : [],

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

