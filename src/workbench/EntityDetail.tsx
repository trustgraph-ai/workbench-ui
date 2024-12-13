
import React, { useState, useEffect } from 'react';

import { Stack } from '@mui/material';

import ChatConversation from './ChatConversation';
import EntityList from './EntityList';
import { Entity } from './state/Entity';
import { useSocket } from './socket/socket';
import { useWorkbenchStateStore } from './state/WorkbenchState';
import {
    RDFS_LABEL, queryFrom, queryLabel, labelS, labelP, labelO
} from './state/graph-algos';

interface EntityDetailProps {
}

const EntityDetail : React.FC <EntityDetailProps> = ({
}) => {

    const socket = useSocket();

    const selected = useWorkbenchStateStore((state) => state.selected);

    if (!selected) {
        return ( <div>No node selected.</div> );
    }

    const [table, setTable] = useState<any[]>([]);

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

