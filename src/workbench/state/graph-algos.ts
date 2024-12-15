
import { Socket } from '../socket/trustgraph-socket';
import { Triple } from './Triple';

export const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";

export const SKOS_DEFINITION =
    "http://www.w3.org/2004/02/skos/core#definition";

export const SCHEMAORG_SUBJECT_OF = "https://schema.org/subjectOf";

export const SCHEMAORG_DESCRIPTION = "https://schema.org/description";

const predefined = {
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

export const LIMIT = 15;

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
        queryOut(socket, uri),
        queryPred(socket, uri),
        queryIn(socket, uri),
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
                            rel: rel.s,
                            src: rel.p,
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

export const toSubgraph = (triples) => {

    interface Node {
        id : string,
        group : number,
    };

    interface Link {
        source : string;
        target : string;
        value : number;
    };

    let nodeId = 0;
    let groupId = 1;

    let nodeIds = new Set<string>();
    let linkIds = new Set<{src : string, dest : string}>();

    let nodes : Node[] = [];
    let links : Link[] = [];

    for (let t of triples) {

        const src = t.s.v;
        const rel = t.p.v;
        const dest = t.o.v;

        if (!nodeIds.has(src)) {
            const n = { id: src, group: groupId };
            nodes.push(n);
            nodeIds.add(src);
        }

        if (!nodeIds.has(dest)) {
            const n = { id: dest, group: groupId };
            nodes.push(n);
            nodeIds.add(dest);
        }

        if (!linkIds.has({src: src, dest: dest})) {
            const l = { src: src, dest: dest, value: 1 };
            links.push(l);
            linkIds.add({src: src, dest: dest});
        }

    }

    return {
        nodes: nodes,
        links : links
    };

};

export const getSubgraph = (socket : Socket, uri : string) => {

    return query(socket, uri).then(
        (d) => labelS(socket, d)
    ).then(
        (d) => labelP(socket, d)
    ).then(
        (d) => labelO(socket, d)
    ).then(
        (d) => filterInternals(d)
    ).then(
        (d) => toSubgraph(d)
    );

};

