
import React, { useState, useEffect } from 'react';

import { Stack } from '@mui/material';

import ChatConversation from './ChatConversation';
import EntityList from './EntityList';
import { Entity } from './state/Entity';
import { useSocket } from './socket/socket';
import { useWorkbenchStateStore } from './state/WorkbenchState';

interface EntityDetailProps {
}

const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label"

const EntityDetail : React.FC <EntityDetailProps> = ({
}) => {

    const socket = useSocket();

    const selected = useWorkbenchStateStore((state) => state.selected);

    if (!selected) {
        return ( <div>No node selected.</div> );
    }

    const [table, setTable] = useState<any[]>([]);

//    setTable([]);

    const queryFrom = (s : string) => {
        return socket.triplesQuery(
            { v: selected.uri, e: true, },
            undefined,
            undefined,
            20,
        );
    }

    const queryLabel = (uri : string) => {
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
    }

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
    }

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
    }

    const labelO = (triples : {s, p, o : Entity}[]) => {
        return Promise.all(
            triples.map(
                (t) => {
                    return queryLabel(t.o.v).then(
                        (label : string) => {
                            return {
                                ...t,
                                olabel: label,
                            };
                        }
                    )
                }
            )
        );
    }

    useEffect(() => {

        queryFrom(selected.uri).then(
            labelS
        ).then(
            labelP
        ).then(
            labelO
        ).then(
            console.log
        );

/*
        socket.triplesQuery(
            {
                v: selected.uri,
                e: true,
            },
            undefined,
            undefined,
            20,
        ).then(
            (triples : Triple[]) =>
                triples.map(
                    (t) => [
                    ]
                )
        ).then(
            (triples : Triple[]) => {
            console.log(triples);
                return {
                    props: triples.filter((t) => !t.o.e),
                    rels: triples.filter((t) => t.o.e),
                }
            }*/
/*
        ).then(
            (resp : any[]) => {

                return Promise.all(
                    resp.map(
                        (t : any) => {
                            return t;
                        }
                    )
                )

            }
        ).then(
            (resp : any) => {
                console.log(resp);
            }
        );



                const tbl = resp.map(
                    (t : Triple) => {
                        return [t.s.v, t.p.v, t.o.v];
                    }
                );
                setTable(tbl);
            }
        );
        */

    }, [selected]);

/*
            return Promise.all<Triple[]>(
                resp.map(
                    (ent : Value) =>
                        socket.triplesQuery(
                            ent
        }
        setTable(
            
        );
        */

    return (
        <>
            <div>
                <div>{selected.label}</div>
                <div>{selected.uri}</div>
            </div>
            <div style={{ borderCollapse: "collapse", paddingTop: '1rem' }}>
                <table style={{ borderCollapse: "collapse" }}>
                <tbody>
                    {
                        table.map(
                            (row, ix) => (
                                <tr key={ix}>
                                    <td style={{
                                        border: '1px solid black',
                                        padding: '1rem',
                                    }}>
                                        {row[0]}
                                    </td>
                                    <td style={{
                                        border: '1px solid black',
                                        padding: '1rem',
                                    }}>
                                        {row[1]}
                                    </td>
                                    <td style={{
                                        border: '1px solid black',
                                        padding: '1rem',
                                    }}>
                                        {row[2]}
                                    </td>
                                </tr>
                            )
                        )
                    }
                    </tbody>
                </table>
            </div>
        </>

    );

}

export default EntityDetail;

