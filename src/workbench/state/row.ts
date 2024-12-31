
import similarity from 'compute-cosine-similarity';

import { Value } from '../state/Triple';
import { Socket } from '../socket/trustgraph-socket';
import { RDFS_LABEL, SKOS_DEFINITION } from '../state/knowledge-graph';

export interface Row {
    uri : string,
    label? : string,
    description? : string,
    embeddings? : number[],
    target? : number[],
    similarity? : number,
};

// Take the embeddings, and lookup entities using graph
// embeddings, add embedding to each entity row, just an easy
// place to put it
export const getGraphEmbeddings =
    (socket : Socket, limit? : number) => {

    // Take the embeddings, and lookup entities using graph
    // embeddings, add embedding to each entity row, just an easy
    // place to put it
    return (vecs : number[][]) : Promise<Row[]> => {
        return socket.graphEmbeddingsQuery(
            vecs, limit ? limit : 10,
        ).then(
            (ents : Value[]) : Row[] => ents.map((ent) => {
                return { uri: ent.v, target: vecs[0] }
            })
        );
    }

}

// For entities, lookup labels
export const addRowLabels =
    (socket : Socket) =>

        (entities : Row[]) : Promise<Row[]> => {
            return Promise.all<Row>(
                entities.map(
                    (ent : Row) =>
                        socket.triplesQuery(
                            { v: ent.uri, e: true },
                            { v: RDFS_LABEL, e: true, },
                            undefined,
                            1
                        ).then(
                            (t): Row => {
                                if (t.length < 1) {
                                    return {
                                        uri: ent.uri,
                                        label: "",
                                        target: ent.target,
                                    };
                                } else {
                                    return {
                                        uri: ent.uri,
                                        label: t[0].o.v,
                                        target: ent.target,
                                    };
                                }
                            }
                        )
                )
            )
        }

// For entities, lookup definitions
export const addRowDefinitions =
    (socket : Socket) =>

        // For entities, lookup labels
        (entities : Row[]) => {
            return Promise.all<Row>(
                entities.map(
                    (ent) =>
                        socket.triplesQuery(
                            { v: ent.uri, e : true },
                            { v: SKOS_DEFINITION, e: true, },
                            undefined,
                            1
                        ).then(
                            (t) => {
                                if (t.length < 1) {
                                    return { ...ent, description: "" };
                                } else {
                                    return {
                                        ...ent,
                                        description: t[0].o.v,
                                    };
                                }
                            }
                        )
                )
            )

        }

// Compute an embedding for each entity based on its definition or label
export const addRowEmbeddings =
    (socket : Socket) =>
        (entities : Row[]) => {
            return Promise.all<Row>(
                entities.map(
                    (ent) => {

                        let text : string = "";
                        if (ent.description && ent.description != "")
                            text = ent.description;
                        else
                            text = ent.label!;

                        return socket.embeddings(text).then(
                             (x) => {
                                 if (x && (x.length > 0)) {
                                     return {
                                         ...ent,
                                         embeddings: x[0]
                                     }
                                 } else {
                                     return {
                                         ...ent,
                                         embeddings: [],
                                     }
                                 };
                             }
                        )
                    }
                )
            );
        };

export const computeCosineSimilarity =
    () =>
        (entities : Row[]) : Row[] =>
            entities.map(
                (ent) => {
                    const sim = similarity(
                        ent.target!, ent.embeddings!
                    );
                    return {
                        uri: ent.uri,
                        label: ent.label,
                        description: ent.description,
                        similarity: sim ? sim : -1,
                    };
                }
            );

export const sortSimilarity =
    () =>
        (entities : Row[]) => {
            let arr = Array.from(entities);
            arr.sort(
               (a, b) => (b.similarity! - a.similarity!)
            );
            return arr;
        };

