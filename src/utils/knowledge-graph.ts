import { BaseApi, Triple, Term, IriTerm, LiteralTerm } from "@trustgraph/client";

// Helper to get the string value from a Term (IRI or Literal)
const getTermValue = (term: Term): string => {
  if (term.t === "i") return (term as IriTerm).i;
  if (term.t === "l") return (term as LiteralTerm).v;
  if (term.t === "b") return term.d;
  return "";
};

// Helper to check if a Term is an IRI
const isIri = (term: Term): term is IriTerm => term.t === "i";

export const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";

export const SKOS_DEFINITION =
  "http://www.w3.org/2004/02/skos/core#definition";

export const SCHEMAORG_SUBJECT_OF = "https://schema.org/subjectOf";

export const SCHEMAORG_DESCRIPTION = "https://schema.org/description";

// Some pre-defined labels, don't need to be fetched from the graph
const predefined: { [k: string]: string } = {
  [RDFS_LABEL]: "label",
  [SKOS_DEFINITION]: "definition",
  [SCHEMAORG_SUBJECT_OF]: "subject of",
  [SCHEMAORG_DESCRIPTION]: "description",
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "has type",
  "https://schema.org/publication": "publication",
  "https://schema.org/url": "url",
  "https://schema.org/PublicationEvent": "publication event",
  "https://schema.org/publishedBy": "published by",
  "https://schema.org/DigitalDocument": "digital document",
  "https://schema.org/startDate": "start date",
  "https://schema.org/endDate": "end date",
  "https://schema.org/name": "name",
  "https://schema.org/copyrightNotice": "copyright notice",
  "https://schema.org/copyrightHolder": "copyright holder",
  "https://schema.org/copyrightYear": "copyright year",
  "https://schema.org/keywords": "keywords",
};

// Default triple limit on queries
export const LIMIT = 30;

// Query triples which match URI on 's'
export const queryS = (
  socket: BaseApi,
  uri: string,
  add: (s: string) => void,
  remove: (s: string) => void,
  limit?: number,
  collection?: string,
) => {
  const act = "Query S: " + uri;
  add(act);

  return socket
    .triplesQuery(
      { t: "i", i: uri },
      undefined,
      undefined,
      limit ? limit : LIMIT,
      collection,
    )
    .then((x) => {
      remove(act);
      return x;
    })
    .catch((err) => {
      remove(act);
      throw err;
    });
};

// Query triples which match URI on 'p'
export const queryP = (
  socket: BaseApi,
  uri: string,
  add: (s: string) => void,
  remove: (s: string) => void,
  limit?: number,
  collection?: string,
) => {
  const act = "Query P: " + uri;
  add(act);

  return socket
    .triplesQuery(
      undefined,
      { t: "i", i: uri },
      undefined,
      limit ? limit : LIMIT,
      collection,
    )
    .then((x) => {
      remove(act);
      return x;
    })
    .catch((err) => {
      remove(act);
      throw err;
    });
};

// Query triples which match URI on 'o'
export const queryO = (
  socket: BaseApi,
  uri: string,
  add: (s: string) => void,
  remove: (s: string) => void,
  limit?: number,
  collection?: string,
) => {
  const act = "Query O: " + uri;
  add(act);

  return socket
    .triplesQuery(
      undefined,
      undefined,
      { t: "i", i: uri },
      limit ? limit : LIMIT,
      collection,
    )
    .then((x) => {
      remove(act);
      return x;
    })
    .catch((err) => {
      remove(act);
      throw err;
    });
};

// Query triples which match URI on 's', 'p' or 'o'.
export const query = (
  socket: BaseApi,
  uri: string,
  add: (s: string) => void,
  remove: (s: string) => void,
  limit?: number,
  collection?: string,
) => {
  const act = "Query: " + uri;
  add(act);

  return Promise.all([
    queryS(socket, uri, add, remove, limit, collection),
    queryP(socket, uri, add, remove, limit, collection),
    queryO(socket, uri, add, remove, limit, collection),
  ])
    .then((resp) => {
      return resp[0].concat(resp[1]).concat(resp[2]);
    })
    .then((x) => {
      remove(act);
      return x;
    })
    .catch((err) => {
      remove(act);
      throw err;
    });
};

// Convert a URI to its label by querying the graph store, returns a
// promise
export const queryLabel = (
  socket: BaseApi,
  uri: string,
  add: (s: string) => void,
  remove: (s: string) => void,
  collection?: string,
): Promise<string> => {
  const act = "Label " + uri;

  // If the URI is in the pre-defined list, just return that
  if (uri in predefined) {
    return new Promise((s) => s(predefined[uri]));
  }

  add(act);

  // Search tthe graph for the URI->label relationship
  return socket
    .triplesQuery(
      { t: "i", i: uri },
      { t: "i", i: RDFS_LABEL },
      undefined,
      1,
      collection,
    )
    .then((triples: Triple[]) => {
      // If got a result, return the label, otherwise the URI
      // can be its own label
      if (triples.length > 0) return getTermValue(triples[0].o);
      else return uri;
    })
    .then((x) => {
      remove(act);
      return x;
    })
    .catch((err) => {
      remove(act);
      throw err;
    });
};

// Add 'label' elements to 's' elements in a list of triples.
// Returns a promise
export const labelS = (
  socket: BaseApi,
  triples: Triple[],
  add: (s: string) => void,
  remove: (s: string) => void,
  collection?: string,
) => {
  return Promise.all(
    triples.map((t) => {
      return queryLabel(socket, getTermValue(t.s), add, remove, collection).then(
        (label: string) => {
          return {
            ...t,
            s: {
              ...t.s,
              label: label,
            } as Term,
          };
        },
      );
    }),
  );
};

// Add 'label' elements to 'p' elements in a list of triples.
// Returns a promise
export const labelP = (
  socket: BaseApi,
  triples: Triple[],
  add: (s: string) => void,
  remove: (s: string) => void,
  collection?: string,
) => {
  return Promise.all(
    triples.map((t) => {
      return queryLabel(socket, getTermValue(t.p), add, remove, collection).then(
        (label: string) => {
          return {
            ...t,
            p: {
              ...t.p,
              label: label,
            } as Term,
          };
        },
      );
    }),
  );
};

// Add 'label' elements to 'o' elements in a list of triples.
// Returns a promise
export const labelO = (
  socket: BaseApi,
  triples: Triple[],
  add: (s: string) => void,
  remove: (s: string) => void,
  collection?: string,
) => {
  return Promise.all(
    triples.map((t) => {
      // If the 'o' element is an IRI, do a label lookup, else
      // just use the literal value for its label
      if (isIri(t.o))
        return queryLabel(socket, t.o.i, add, remove, collection).then(
          (label: string) => {
            return {
              ...t,
              o: {
                ...t.o,
                label: label,
              } as Term,
            };
          },
        );
      else
        return new Promise((resolve) => {
          resolve({
            ...t,
            o: {
              ...t.o,
              label: getTermValue(t.o),
            } as Term,
          });
        });
    }),
  );
};

// Triple filter
export const filter = (triples: Triple[], fn: (t: Triple) => boolean) =>
  triples.filter((t) => fn(t));

// Filter out 'structural' edges nobody needs to see
export const filterInternals = (triples: Triple[]) =>
  triples.filter((t) => {
    if (isIri(t.p) && t.p.i == RDFS_LABEL) return false;
    return true;
  });

// Generic triple fetcher, fetches triples related to a URI, adds labels
// and provides over-arching uri/label props for the input URI
export const getTriples = (
  socket: BaseApi,
  flowId: string,
  uri: string,
  add: (s: string) => void,
  remove: (s: string) => void,
  limit?: number,
  collection?: string,
) => {
  // FIXME: Cache more
  // FIXME: Too many queries

  const api = socket.flow(flowId);

  return query(api, uri, add, remove, limit, collection)
    .then((d) => labelS(api, d, add, remove, collection))
    .then((d) => labelP(api, d, add, remove, collection))
    .then((d) => labelO(api, d, add, remove, collection))
    .then((d) => filterInternals(d))
    .then((d) => {
      return queryLabel(api, uri, add, remove, collection).then(
        (label: string) => {
          return {
            triples: d,
            uri: uri,
            label: label,
          };
        },
      );
    });
};
