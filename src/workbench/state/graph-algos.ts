
const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label"

const queryFrom = (s : string) => {
    return socket.triplesQuery(
        { v: selected.uri, e: true, },
        undefined,
        undefined,
        20,
    );
};

const queryLabel = (uri : string) => {
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

const labelS = (triples : {s, p, o : Entity}[]) => {
    return Promise.all(
        triples.map(
            (t) => {
                return queryLabel(t.s.v).then(
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

const labelP = (triples : {s, p, o : Entity}[]) => {
    return Promise.all(
        triples.map(
            (t) => {
                return queryLabel(t.p.v).then(
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


const labelO = (triples : {s, p, o : Entity}[]) => {
    return Promise.all(
        triples.map(
            (t) => {
                if (t.o.e) 
                    return queryLabel(t.o.v).then(
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

