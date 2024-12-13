
import { Socket } from './trustgraph-socket';

export const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label"

export const queryFrom = (socket : Socket, uri : string) => {
    return socket.triplesQuery(
        { v: uri, e: true, },
        undefined,
        undefined,
        20,
    );
};

export const queryLabel = (socket : Socket, uri : string) => {
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

export const labelS = (socket : Socket, triples : {s, p, o : Entity}[]) => {
    return Promise.all(
        triples.map(
            (t) => {
                return queryLabel(socket, t.s.v).then(
                    (label : string) => {
                        return {
                            ...t,
                            slabel: label,
                        };
                    }
                )
            }
        )
    );
};

export const labelP = (socket : Socket, triples : {s, p, o : Entity}[]) => {
    return Promise.all(
        triples.map(
            (t) => {
                return queryLabel(socket, t.p.v).then(
                    (label : string) => {
                        return {
                            ...t,
                            plabel: label,
                        };
                    }
                )
            }
        )
    );
};

export const labelO = (socket : Socket, triples : {s, p, o : Entity}[]) => {
    return Promise.all(
        triples.map(
            (t) => {
                if (t.o.e) 
                    return queryLabel(socket, t.o.v).then(
                        (label : string) => {
                            return {
                                ...t,
                                olabel: label,
                            };
                        }
                    );
                else
                    return new Promise(
                        (resolve, reject) => {
                            resolve({
                                ...t,
                                olabel: t.o.v,
                            });
                        }
                    );
            }
        )
    );
};

export const selectRels =
    (triples : any[]) => triples.filter((t) => t.o.e);

export const selectProps =
    (triples : any[]) => triples.filter((t) => !t.o.e);

export const divide =
    (triples : any[]) => {
        return {
            props: selectProps(triples),
            rels: selectRels(triples),
        };
    };

