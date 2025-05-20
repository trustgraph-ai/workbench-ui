
import { create } from 'zustand'

export interface ProgressState {

    activity : Set<string>;

    error : string;

    addActivity : (act : string) => void;
    removeActivity : (act : string) => void;

    setError : (error : string) => void;

}

export const useProgressStateStore = create<ProgressState>()(

    (set) => ({

        activity: new Set<string>([]),

        error: "",

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
        }),

        setError: (error) => set((state) => {
            return {
                ...state,
                error: error,
            };
        }),

    }),

);

