
import { create } from 'zustand'
import { Entity } from './Entity';

export interface WorkbenchState {

    selected? : Entity;
    tool : string;
    entities : Entity[];

    setSelected : (e : Entity) => void;
    unsetSelected : () => void;

    setTool : (v : string) => void;
    setEntities : (ents : Entity[]) => void;

}

export const useWorkbenchStateStore = create<WorkbenchState>()(

    (set) => ({

        selected : undefined,

        tool : "chat",

        entities : [],

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

