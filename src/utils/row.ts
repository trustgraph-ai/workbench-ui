import similarity from "compute-cosine-similarity";

import { Term, IriTerm, LiteralTerm, BaseApi } from "@trustgraph/client";
import { RDFS_LABEL, SKOS_DEFINITION } from "./knowledge-graph";

export interface Row {
  uri: string;
  label?: string;
  description?: string;
  embeddings?: number[];
  target?: number[];
  similarity?: number;
}

// Take the embeddings, and lookup entities using graph
// embeddings, add embedding to each entity row, just an easy
// place to put it
export const getGraphEmbeddings = (
  socket: BaseApi,
  add: (s: string) => void,
  remove: (s: string) => void,
  limit?: number,
  collection?: string,
) => {
  // Take the embeddings, and lookup entities using graph
  // embeddings, add embedding to each entity row, just an easy
  // place to put it
  return (vecs: number[][]): Promise<Row[]> => {
    const act = "Graph embedding search";
    add(act);

    return socket
      .graphEmbeddingsQuery(vecs, limit ? limit : 10, collection)
      .then((ents: Term[]): Row[] => {
        remove(act);
        return ents
          .filter((ent): ent is IriTerm => ent.t === "i")
          .map((ent) => {
            return { uri: ent.i, target: vecs[0] };
          });
      })
      .catch((err) => {
        remove(act);
        throw err;
      });
  };
};

// For entities, lookup labels
export const addRowLabels =
  (
    socket: BaseApi,
    add: (s: string) => void,
    remove: (s: string) => void,
    collection?: string,
  ) =>
  (entities: Row[]): Promise<Row[]> => {
    return Promise.all<Row>(
      entities.map((ent: Row) => {
        const act = "Label " + ent.uri;
        add(act);
        return socket
          .triplesQuery(
            { t: "i", i: ent.uri },
            { t: "i", i: RDFS_LABEL },
            undefined,
            1,
            collection,
          )
          .then((t): Row => {
            if (t.length < 1) {
              remove(act);
              return {
                uri: ent.uri,
                label: "",
                target: ent.target,
              };
            } else {
              remove(act);
              const obj = t[0].o as LiteralTerm;
              return {
                uri: ent.uri,
                label: obj.v,
                target: ent.target,
              };
            }
          })
          .catch((err) => {
            remove(act);
            throw err;
          });
      }),
    );
  };

// For entities, lookup definitions
export const addRowDefinitions =
  (
    socket: BaseApi,
    add: (s: string) => void,
    remove: (s: string) => void,
    collection?: string,
  ) =>
  // For entities, lookup labels
  (entities: Row[]) => {
    return Promise.all<Row>(
      entities.map((ent) => {
        const act = "Description " + ent.uri;
        add(act);
        return socket
          .triplesQuery(
            { t: "i", i: ent.uri },
            { t: "i", i: SKOS_DEFINITION },
            undefined,
            1,
            collection,
          )
          .then((t) => {
            if (t.length < 1) {
              remove(act);
              return { ...ent, description: "" };
            } else {
              remove(act);
              const obj = t[0].o as LiteralTerm;
              return {
                ...ent,
                description: obj.v,
              };
            }
          })
          .catch((err) => {
            remove(act);
            throw err;
          });
      }),
    );
  };

// Compute an embedding for each entity based on its definition or label
export const addRowEmbeddings =
  (socket: BaseApi, add: (s: string) => void, remove: (s: string) => void) =>
  (entities: Row[]) => {
    return Promise.all<Row>(
      entities.map((ent) => {
        let text: string = "";
        if (ent.description && ent.description != "") text = ent.description;
        else text = ent.label!;

        const act = "Embeddings " + text.substring(0, 20);
        add(act);

        return socket
          .embeddings(text)
          .then((x) => {
            if (x && x.length > 0) {
              remove(act);
              return {
                ...ent,
                embeddings: x[0],
              };
            } else {
              remove(act);
              return {
                ...ent,
                embeddings: [],
              };
            }
          })
          .catch((err) => {
            remove(act);
            throw err;
          });
      }),
    );
  };

// Rest of the procecess is not async, so not adding progress

export const computeCosineSimilarity =
  () =>
  (entities: Row[]): Row[] =>
    entities.map((ent) => {
      const sim = similarity(ent.target!, ent.embeddings!);
      return {
        uri: ent.uri,
        label: ent.label,
        description: ent.description,
        similarity: sim ? sim : -1,
      };
    });

export const sortSimilarity = () => (entities: Row[]) => {
  const arr = Array.from(entities);
  arr.sort((a, b) => b.similarity! - a.similarity!);
  return arr;
};
