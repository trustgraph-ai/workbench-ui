
import React, { useState, useEffect, ReactNode } from 'react';

import { Typography, Box, Stack, Button } from '@mui/material';

import { ArrowForward, ArrowBack } from '@mui/icons-material';

import { ForceGraph3D } from 'react-force-graph';
import SpriteText from "https://esm.sh/three-spritetext";

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

            <ForceGraph3D
                graphData={view}
                nodeLabel="nid"
                nodeAutoColorBy="group"
                linkThreeObjectExtend={true}
                linkThreeObject={link => {
                    // extend link with text sprite
                    const sprite = new SpriteText(
                        `${link.source} > ${link.target}`
                    );
                    sprite.color = 'lightgrey';
                    sprite.textHeight = 1.5;
                    return sprite;
                }}
                linkPositionUpdate={(sprite, { start, end }) => {
                    const middlePos = Object.assign(
                        ...['x', 'y', 'z'].map(
                            c => ({
                                [c]: start[c] + (end[c] - start[c]) / 2
                            })
                        )
                    )
                    Object.assign(sprite.position, middlePos);
                }}
            />
        </>
    );

}

export default GraphView;

