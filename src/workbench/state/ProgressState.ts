
import { create } from 'zustand'

export interface ProgressState {

    working : number;

    incWorking : () => void;
    decWorking : () => void;

}

export const useProgressStateStore = create<ProgressState>()(

    (set) => ({

        working: 0,

        incWorking: () => set((state) => ({
	    working: state.working + 1,
	})),

        decWorking: () => set((state) => ({
	    working: state.working - 1,
	})),

    })

);

