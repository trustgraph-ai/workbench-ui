
import { Socket } from '../socket/trustgraph-socket';
import { Triple } from './Triple';

export const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";

export const SKOS_DEFINITION =
    "http://www.w3.org/2004/02/skos/core#definition";

export const SCHEMAORG_SUBJECT_OF = "https://schema.org/subjectOf";

export const SCHEMAORG_DESCRIPTION = "https://schema.org/description";

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
};

export const LIMIT = 30;

export const queryOut = (socket : Socket, uri : string, limit? : number) => {
    return socket.triplesQuery(
        { v: uri, e: true, },
        undefined,
        undefined,
        limit ? limit : LIMIT,
    ).then(
        (triples) => triples.map(
            (t) => { return { ...t, direc: "out" } }
        )
    );
};

export const queryIn = (socket : Socket, uri : string, limit? : number) => {
    return socket.triplesQuery(
        undefined,
        undefined,
        { v: uri, e: true, },
        limit ? limit : LIMIT,
    ).then(
        (triples) => triples.map(
            (t) => { return { ...t, direc: "in" } }
        )
    );
};

export const queryPred = (socket : Socket, uri : string, limit? : number) => {
    return socket.triplesQuery(
        undefined,
        { v: uri, e: true, },
        undefined,
        limit ? limit : LIMIT,
    ).then(
        (triples) => triples.map(
            (t) => { return { ...t, direc: "pred" } }
        )
    );
};

export const query = (socket : Socket, uri : string, limit? : number) => {
    return Promise.all([
        queryOut(socket, uri, limit),
        queryPred(socket, uri, limit),
        queryIn(socket, uri, limit),
    ]).then(
        (resp) => {
            return resp[0].concat(resp[1]).concat(resp[2]);
        }
    );
};

export const queryLabel =
    (socket : Socket, uri : string) : Promise<string> => {
        if (uri in predefined) {
            return new Promise((s) => s(predefined[uri]));
            }

        return socket.triplesQuery(
            { v: uri, e: true, },
            { v: RDFS_LABEL, e : true, },
            undefined,
            1,
        ).then(
            (triples : Triple[]) => {
                if (triples.length > 0)
                    return triples[0].o.v;
                else
                    return uri;
            }
        );

    };

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

export const labelO = (socket : Socket, triples : Triple[]) => {
    return Promise.all(
        triples.map(
            (t) => {
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

export const divide =
    (triples : any[]) => {
        return {
            props: selectProps(triples),
            in: selectIn(triples),
            out: selectOut(triples),
            pred: selectPred(triples),
        };
    };

export const filter =
    (triples : any[], fn : any) => triples.filter((t) => fn(t));

export const selectRels =
    (triples : any[]) => filter(triples, (t : Triple) => t.o.e);

export const selectIn =
    (triples : any[]) => filter(
        triples,
        (t : Triple) => (t.direc == "in"),
    );

export const selectOut =
    (triples : any[]) => filter(
        triples,
        (t : Triple) => (t.o.e && t.direc == "out"),
    );

export const selectPred =
    (triples : any[]) => filter(
        triples,
        (t : Triple) => (t.direc == "pred"),
    );

export const selectProps =
    (triples : any[]) => filter(
        triples,
        (t : Triple) => (t.direc == "in" && !t.o.e)
    );

export const filterInternals =
    (triples : any[]) => triples.filter(
        (t) => {
            if (t.p.e && t.p.v == RDFS_LABEL) return false;
            return true;
        }
    );

export const getView =
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
        (d) => divide(d)
    ).then(
        (d) => {
            return {
                ...d,
                props: d.props.map(
                    (prop) => {
                        return {
                            prop: prop.p,
                            value: prop.o,
                        };
                    }
                ),
            };
        }
    ).then(
        (d) => {
            return {
                ...d,
                in: d.in.map(
                    (rel) => {
                        return {
                            rel: rel.p,
                            entity: rel.s,
                        };
                    }
                ),
                out: d.out.map(
                    (rel) => {
                        return {
                            rel: rel.p,
                            entity: rel.o,
                        };
                    }
                ),
                pred: d.pred.map(
                    (rel) => {
                        return {
                            src: rel.s,
                            rel: rel.p,
                            dest: rel.o,
                        };
                    }
                ),
            };
        }
    ).then(
        (d) => {
            return queryLabel(socket, uri).then(
                (label : string) => {
                     return {
                          ...d,
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

