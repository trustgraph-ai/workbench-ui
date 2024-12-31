
import { create } from 'zustand'
import { Message } from './Message';
import { Row } from './row';

export interface SearchState {

    rows : Row[];
    setRows : (v : Row[]) => void;

    input : string;
    setInput : (v : string) => void;

}

export const useSearchStateStore = create<SearchState>()(

    (set) => ({

        rows: [],
        input: "",

        setRows: (v) => set(() => ({
	    rows: v,
	})),

        setInput: (v) => set(() => ({
	    input: v,
	})),

    })

);

