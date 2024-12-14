
import { Socket } from '../socket/trustgraph-socket';
import { Triple } from './Triple';

export const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label"
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

export const query = (socket : Socket, uri : string, limit? : number) => {
    return Promise.all([
        queryOut(socket, uri), queryIn(socket, uri)
    ]).then(
        (resp) => {
            return resp[0].concat(resp[1]);
        }
    );
};

export const queryLabel =
    (socket : Socket, uri : string) : Promise<string> => {
        if (uri == RDFS_LABEL)
            return new Promise((s) => s("label"));

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
        };
    };

export const filter =
    (triples : any[], fn : any) => triples.filter((t) => fn(t));

export const selectRels =
    (triples : any[]) => filter(triples, (t : Triple) => t.o.e);

export const selectIn =
    (triples : any[]) => filter(
        triples,
        (t : Triple) => (t.o.e && t.direc == "in"),
    );

export const selectOut =
    (triples : any[]) => filter(
        triples,
        (t : Triple) => (t.o.e && t.direc == "out"),
    );

export const selectProps =
    (triples : any[]) => filter(triples, (t : Triple) => !t.o.e);

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

