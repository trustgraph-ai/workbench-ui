
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
export const queryS = (socket : Socket, uri : string, limit? : number) => {
    return socket.triplesQuery(
        { v: uri, e: true, },
        undefined,
        undefined,
        limit ? limit : LIMIT,
    );
};

// Query triples which match URI on 'p'
export const queryP = (socket : Socket, uri : string, limit? : number) => {
    return socket.triplesQuery(
        undefined,
        { v: uri, e: true, },
        undefined,
        limit ? limit : LIMIT,
    );
};

// Query triples which match URI on 'o'
export const queryO = (socket : Socket, uri : string, limit? : number) => {
    return socket.triplesQuery(
        undefined,
        undefined,
        { v: uri, e: true, },
        limit ? limit : LIMIT,
    );
};

// Query triples which match URI on 's', 'p' or 'o'.
export const query = (socket : Socket, uri : string, limit? : number) => {
    return Promise.all([
        queryS(socket, uri, limit),
        queryP(socket, uri, limit),
        queryO(socket, uri, limit),
    ]).then(
        (resp) => {
            return resp[0].concat(resp[1]).concat(resp[2]);
        }
    );
};

// Convert a URI to its label by querying the graph store, returns a
// promise
export const queryLabel =
    (socket : Socket, uri : string) : Promise<string> => {

        // If the URI is in the pre-defined list, just return that
        if (uri in predefined) {
            return new Promise((s) => s(predefined[uri]));
        }

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
        );

    };

// Add 'label' elements to 's' elements in a list of triples.
// Returns a promise
export const labelS = (socket : Socket, triples : Triple[]) => {
    return Promise.all(
        triples.map(
            (t) => {
                return queryLabel(socket, t.s.v).then(
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
export const labelP = (socket : Socket, triples : Triple[]) => {
    return Promise.all(
        triples.map(
            (t) => {
                return queryLabel(socket, t.p.v).then(
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
export const labelO = (socket : Socket, triples : Triple[]) => {
    return Promise.all(
        triples.map(
            (t) => {

                // If the 'o' element is a entity, do a label lookup, else
                // just use the literal value for its label
                if (t.o.e) 
                    return queryLabel(socket, t.o.v).then(
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

export const filter =
    (triples : any[], fn : any) => triples.filter((t) => fn(t));

export const filterInternals =
    (triples : any[]) => triples.filter(
        (t) => {
            if (t.p.e && t.p.v == RDFS_LABEL) return false;
            return true;
        }
    );

export const getTriples =

    (socket : Socket, uri : string) => {

    // FIXME: Cache more
    // FIXME: Too many queries

    return query(socket, uri).then(
        (d) => labelS(socket, d)
    ).then(
        (d) => labelP(socket, d)
    ).then(
        (d) => labelO(socket, d)
    ).then(
        (d) => filterInternals(d)
    ).then(
        (d) => {
            return queryLabel(socket, uri).then(
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

interface Node {
    id : string,
    label : string,
    group : number,
};

interface Link {
    id : string;
    source : string;
    target : string;
    label : string;
    value : number;
};

export interface Subgraph {
    nodes : Node[];
    links : Link[];
};

export const createSubgraph = () : Subgraph => {
    return {
        nodes: [],
        links: [],
    };
};

export const updateSubgraphTriples = (
    sg : Subgraph, triples : Triple[]
) => {

    const groupId = 1;

    let nodeIds = new Set<string>(sg.nodes.map(n => n.id));
    let linkIds = new Set<string>(sg.links.map(n => n.id));

    for (let t of triples) {

        // Source has a URI, that can be its unique ID
        const sourceId = t.s.v;

        // Same for target, unless it's a literal, in which case
        // use an ID which is unique to this edge so that it gets its
        // own node
        const targetId = t.o.e ? t.o.v : (t.s.v + "@@" + t.p.v + "@@" + t.o.e);

        // Links have an ID so that this edge is unique
        const linkId = (t.s.v + "@@" + t.p.v + "@@" + t.o.e);

        if (!nodeIds.has(sourceId)) {
            const n : Node = {
                id: sourceId,
                label: t.s.label ? t.s.label : "unknown",
                group: groupId,
            };
            nodeIds.add(sourceId);
            sg = {
                ...sg,
                nodes: [
                    ...sg.nodes,
                    n,
                ]
            }
        }

        if (!nodeIds.has(targetId)) {
            const n : Node = {
                id: targetId,
                label: t.o.label ? t.o.label : "unknown",
                group: groupId,
            };
            nodeIds.add(targetId);
            sg = {
                ...sg,
                nodes: [
                    ...sg.nodes,
                    n,
                ]
            }
        }

        if (!linkIds.has(linkId)) {
            const l : Link = {
                source: sourceId,
                target: targetId,
                id: linkId,
                label: t.p.label ? t.p.label : "unknown",
                value: 1,
            };
            linkIds.add(linkId);
            sg = {
                ...sg,
                links: [
                    ...sg.links,
                    l,
                ]
            }
        }

    }

    return sg;

};

export const updateSubgraph = (
    socket : Socket, uri : string, sg : Subgraph
) => {

    return query(socket, uri).then(
        (d) => labelS(socket, d)
    ).then(
        (d) => labelP(socket, d)
    ).then(
        (d) => labelO(socket, d)
    ).then(
        (d) => filterInternals(d)
    ).then(
        (d) => updateSubgraphTriples(sg, d)
    );

};

