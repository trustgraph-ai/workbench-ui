
import { Socket } from '../socket/trustgraph-socket';
import { Triple } from './Triple';

export const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";

export const SKOS_DEFINITION =
    "http://www.w3.org/2004/02/skos/core#definition";

export const SCHEMAORG_SUBJECT_OF = "https://schema.org/subjectOf";

export const SCHEMAORG_DESCRIPTION = "https://schema.org/description";

// Some pre-defined labels, don't need to be fetched from the graph
const predefined : {[k : string] : string} = {
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
export const queryS =
    (socket : Socket, uri : string, add, remove, limit? : number) => {

        const act = "Query S: " + uri;
        add(act);

        return socket.triplesQuery(
            { v: uri, e: true, },
            undefined,
            undefined,
            limit ? limit : LIMIT,
        ).then(
            (x) => {
                remove(act);
                return x;
            }
        ).catch(
            (err) => {
                remove(act);
                throw err;
            }
        );
        

    };

// Query triples which match URI on 'p'
export const queryP =
    (socket : Socket, uri : string, add, remove, limit? : number) => {

        const act = "Query P: " + uri;
        add(act);

        return socket.triplesQuery(
            undefined,
            { v: uri, e: true, },
            undefined,
            limit ? limit : LIMIT,
        ).then(
            (x) => {
                remove(act);
                return x;
            }
        ).catch(
            (err) => {
                remove(act);
                throw err;
            }
        );
    };

// Query triples which match URI on 'o'
export const queryO =
    (socket : Socket, uri : string, add, remove, limit? : number) => {

        const act = "Query O: " + uri;
        add(act);

        return socket.triplesQuery(
            undefined,
            undefined,
            { v: uri, e: true, },
            limit ? limit : LIMIT,
        ).then(
            (x) => {
                remove(act);
                return x;
            }
        ).catch(
            (err) => {
                remove(act);
                throw err;
            }
        );

    };

// Query triples which match URI on 's', 'p' or 'o'.
export const query =
    (socket : Socket, uri : string, add, remove, limit? : number) => {

        const act = "Query: " + uri;
        add(act);

        return Promise.all([
            queryS(socket, uri, add, remove, limit),
            queryP(socket, uri, add, remove, limit),
            queryO(socket, uri, add, remove, limit),
        ]).then(
            (resp) => {
                return resp[0].concat(resp[1]).concat(resp[2]);
            }
        ).then(
            (x) => {
                remove(act);
                return x;
            }
        ).catch(
            (err) => {
                remove(act);
                throw err;
            }
        );

    };

// Convert a URI to its label by querying the graph store, returns a
// promise
export const queryLabel =
    (socket : Socket, uri : string, add, remove) : Promise<string> => {

        const act = "Label " + uri;

        // If the URI is in the pre-defined list, just return that
        if (uri in predefined) {
            return new Promise((s) => s(predefined[uri]));
        }

        add(act);

        // Search tthe graph for the URI->label relationship
        return socket.triplesQuery(
            { v: uri, e: true, },
            { v: RDFS_LABEL, e : true, },
            undefined,
            1,
        ).then(
            (triples : Triple[]) => {

                // If got a result, return the label, otherwise the URI
                // can be its own label
                if (triples.length > 0)
                    return triples[0].o.v;
                else
                    return uri;
            }
        ).then(
            (x) => {
                remove(act);
                return x;
            }
        ).catch(
            (err) => {
                remove(act);
                throw err;
            }
        );

    };

// Add 'label' elements to 's' elements in a list of triples.
// Returns a promise
export const labelS =
    (socket : Socket, triples : Triple[], add, remove) => {
        return Promise.all(
            triples.map(
                (t) => {
                    return queryLabel(socket, t.s.v, add, remove).then(
                        (label : string) => {
                            return {
                                ...t,
                                s: {
                                    ...t.s,
                                    label: label,
                                },
                            };
                        }
                    )
                }
            )
        );
    };

// Add 'label' elements to 'p' elements in a list of triples.
// Returns a promise
export const labelP =
    (socket : Socket, triples : Triple[], add, remove) => {
        return Promise.all(
            triples.map(
                (t) => {
                    return queryLabel(socket, t.p.v, add, remove).then(
                        (label : string) => {
                            return {
                                ...t,
                                p: {
                                    ...t.p,
                                    label: label,
                                },
                            };
                        }
                    )
                }
            )
        );
    };

// Add 'label' elements to 'o' elements in a list of triples.
// Returns a promise
export const labelO =
    (socket : Socket, triples : Triple[], add, remove) => {
        return Promise.all(
            triples.map(
                (t) => {

                    // If the 'o' element is a entity, do a label lookup, else
                    // just use the literal value for its label
                    if (t.o.e) 
                        return queryLabel(socket, t.o.v, add, remove).then(
                            (label : string) => {
                                return {
                                    ...t,
                                    o: {
                                        ...t.o,
                                        label: label,
                                    },
                                };
                            }
                        );
                    else
                        return new Promise(
                            (resolve) => {
                                resolve({
                                    ...t,
                                    o: {
                                        ...t.o,
                                        label: t.o.v,
                                    },
                                });
                            }
                        );
                }
            )
        );
    };

// Triple filter
export const filter =
    (triples : any[], fn : any) => triples.filter((t) => fn(t));

// Filter out 'structural' edges nobody needs to see
export const filterInternals =
    (triples : any[]) => triples.filter(
        (t) => {
            if (t.p.e && t.p.v == RDFS_LABEL) return false;
            return true;
        }
    );

// Generic triple fetcher, fetches triples related to a URI, adds labels
// and provides over-arching uri/label props for the input URI
export const getTriples =

    (socket : Socket, uri : string, add, remove, limit? : number) => {

    // FIXME: Cache more
    // FIXME: Too many queries

    return query(socket, uri, add, remove, limit).then(
        (d) => labelS(socket, d, add, remove)
    ).then(
        (d) => labelP(socket, d, add, remove)
    ).then(
        (d) => labelO(socket, d, add, remove)
    ).then(
        (d) => filterInternals(d, add, remove)
    ).then(
        (d) => {
            return queryLabel(socket, uri, add, remove).then(
                (label : string) => {
                     return {
                          triples: d,
                          uri: uri,
                          label: label,
                     };
                }
            );
        }
    );

};
