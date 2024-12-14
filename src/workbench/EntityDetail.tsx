
import React, { useState, useEffect } from 'react';

//import { Stack } from '@mui/material';

//import { Entity } from './state/Entity';
import { useSocket } from './socket/socket';
import { useWorkbenchStateStore } from './state/WorkbenchState';
import {
    tabulate
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
    const [stuff, setStuff] = useState<string>("");

    useEffect(() => {

        tabulate(socket, selected.uri).then(
//            (d) => setTable(d)
 (d : any) => {
    setStuff(JSON.stringify(d, null, 4));
    setTable({});
 }
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

<pre>
{stuff}
</pre>
{/*
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
            */}

        </>

    );

}

export default EntityDetail;

