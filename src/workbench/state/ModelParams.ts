
const TRUSTGRAPH_VERSION = "0.17.11";

import { create } from 'zustand'

export interface ModelParams {

    graphStore : string;
    vectorDB : string;
    chunkerType: string;
    chunkSize : number;
    chunkOverlap : number;
    modelDeployment : string;
    modelName : string;
    temperature : number;
    maxOutputTokens : number;
    platform : string;
    trustgraphVersion : string;

    setGraphStore : (v : string) => void;
    setVectorDB : (v : string) => void;
    setChunkerType: (v : string) => void;
    setChunkSize : (v : number) => void;
    setChunkOverlap : (v : number) => void;
    setModelDeployment : (v : string) => void;
    setModelName : (v : string) => void;
    setTemperature : (v : number) => void;
    setMaxOutputTokens : (v : number) => void;
    setPlatform : (v : string) => void;

}

export const useModelParamsStore = create<ModelParams>()(
    (set) => ({

        graphStore: "cassandra",
        vectorDB: "qdrant",
        chunkerType: "chunker-recursive",
        chunkSize: 1000,
        chunkOverlap: 50,
        modelDeployment: "ollama",
        modelName: "gemma2:9b",
        temperature: 0.3,
        maxOutputTokens: 2048,
        platform: "docker-compose",
        trustgraphVersion: TRUSTGRAPH_VERSION,

        setGraphStore: (v) => set(() => ({
	    graphStore: v,
	})),

        setVectorDB: (v) => set(() => ({
	    vectorDB: v,
	})),

        setChunkerType: (v) => set(() => ({
	    chunkerType: v,
	})),

        setChunkSize: (v) => set(() => ({
	    chunkSize: v,
	})),

        setChunkOverlap: (v) => set(() => ({
	    chunkOverlap: v,
	})),

        setModelDeployment: (v) => set(() => ({
	    modelDeployment: v,
	})),

        setModelName: (v) => set(() => ({
	    modelName: v,
	})),

        setTemperature: (v) => set(() => ({
	    temperature: v,
	})),

        setMaxOutputTokens: (v) => set(() => ({
	    maxOutputTokens: v,
	})),

        setPlatform: (v) => set(() => ({
	    platform: v
	})),

    })
);

