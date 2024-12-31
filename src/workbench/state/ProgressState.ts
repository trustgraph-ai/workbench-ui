
import { create } from 'zustand'

export interface ProgressState {

    activity : Set<string>;

//    working : () => number;

//    incWorking : () => void;
//    decWorking : () => void;

    addActivity : (act : string) => void;
    removeActivity : (act : string) => void;

}

export const useProgressStateStore = create<ProgressState>()(

    (set) => ({

        activity : new Set<string>([]),

        addActivity: (act) => set((state) => {
            let n = new Set(state.activity);
            n.add(act);
            return {
                ...state,
                activity: n,
            };
        }),

        removeActivity: (act) => set((state) => {
            let n = new Set(state.activity);
            n.delete(act);
            return {
                ...state,
                activity: n,
            };
        })

    })

);

