
import React, { useState, useEffect, ReactNode } from 'react';

import { Typography, Box, Stack, Button } from '@mui/material';

import { ArrowForward, ArrowBack } from '@mui/icons-material';

import { useSocket } from './socket/socket';
import { useWorkbenchStateStore } from './state/WorkbenchState';
import { getSubgraph } from './state/graph-algos';

interface GraphViewProps {
}

const GraphView : React.FC <GraphViewProps> = ({
}) => {

    const socket = useSocket();

    const selected = useWorkbenchStateStore((state) => state.selected);

    if (!selected) {
        return ( <div>No node selected.</div> );
    }

    const [view, setView] = useState<any>(undefined);

    useEffect(() => {

        getSubgraph(socket, selected.uri).then(
            (d) => {
                setView(d);
            }
        );

    }, [selected]);

    console.log(view);

    if (!view)
        return ( <div>No data.</div> );

////////////////////////////////////////////////////////////////////////////
// FIXME: These keys won't track change!
////////////////////////////////////////////////////////////////////////////

    return (
        <>
            <Typography variant="h5" component="div" gutterBottom>
                {selected.label}
            </Typography>

        </>

    );

}

export default GraphView;

