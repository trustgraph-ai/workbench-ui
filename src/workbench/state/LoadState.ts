
import { create } from 'zustand'

export interface LoadState {

    title : string;
    url : string;
    keywords : string;
    operation : string;
    files : File[];
    uploaded : string[];
    text : string;

    setTitle : (v : string) => void;
    setUrl : (v : string) => void;
    setKeywords : (v : string) => void;
    setOperation : (v : string) => void;
    setFiles : (v : File[]) => void;
    setUploaded : (v : string[]) => void;
    setText : (v : string) => void;

}

export const useSearchStateStore = create<SearchState>()(

    (set) => ({

        title: "",
        url: "",
        keywords: "",
        operation: "",
        files: [],
        uploaded: [],
        text: "",

        setTitle: (v) => set(() => ({
            title: v,
        })),

        setUrl:  (v) => set(() => ({
            url: v,
        })),

        setKeywords:  (v) => set(() => ({
            keywords: v,
        })),

        setOperation:  (v) => set(() => ({
            operation: v,
        })),

        setFiles:  (v) => set(() => ({
            files: v,
        })),

        setUploaded:  (v) => set(() => ({
            uploaded: v,
        })),

        setText:  (v) => set(() => ({
            text: v,
        })),


    })

);

