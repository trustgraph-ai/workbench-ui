
import React, { useState, useEffect } from 'react';

import { Stack } from '@mui/material';

import ChatConversation from './ChatConversation';
import EntityList from './EntityList';
import { Entity } from './state/Entity';
import { useSocket } from './socket/socket';
import { useWorkbenchStateStore } from './state/WorkbenchState';
import {
    RDFS_LABEL, queryFrom, queryLabel, labelS, labelP, labelO, divide,
    filterUnwanted,
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

    const [table, setTable] = useState<any>(undefined);

    useEffect(() => {

        queryFrom(socket, selected.uri).then(
            (d) => labelS(socket, d)
        ).then(
            (d) => labelP(socket, d)
        ).then(
            (d) => labelO(socket, d)
        ).then(
            (d) => filterUnwanted(d)
        ).then(
            (d) => divide(d)
        ).then(
            (d) => setTable(d)
        );

    }, [selected]);

    if (!table)
        return ( <div>No data.</div> );

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
                        table.rels.map(
                            (row, ix) => (
                                <tr key={ix}>
                                    <td style={{
                                        border: '1px solid black',
                                        padding: '1rem',
                                    }}>
                                        {row.slabel}
                                    </td>
                                    <td style={{
                                        border: '1px solid black',
                                        padding: '1rem',
                                    }}>
                                        {row.plabel}
                                    </td>
                                    <td style={{
                                        border: '1px solid black',
                                        padding: '1rem',
                                    }}>
                                        {row.olabel}
                                    </td>
                                </tr>
                            )
                        )
                    }
                    </tbody>
                </table>

            </div>


            <div style={{ borderCollapse: "collapse", paddingTop: '1rem' }}>

                <table style={{ borderCollapse: "collapse" }}>
                <tbody>
                    {
                        table.props.map(
                            (row, ix) => (
                                <tr key={ix}>
                                    <td style={{
                                        border: '1px solid black',
                                        padding: '1rem',
                                    }}>
                                        {row.slabel}
                                    </td>
                                    <td style={{
                                        border: '1px solid black',
                                        padding: '1rem',
                                    }}>
                                        {row.plabel}
                                    </td>
                                    <td style={{
                                        border: '1px solid black',
                                        padding: '1rem',
                                    }}>
                                        {row.olabel}
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

