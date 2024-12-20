
import React, { useState, useEffect, useRef } from 'react';

import { Typography, Box } from '@mui/material';

import { ForceGraph3D } from 'react-force-graph';
import SpriteText from 'three-spritetext'

import { useSocket } from './socket/socket';
import { useWorkbenchStateStore } from './state/WorkbenchState';
import {
    createSubgraph, updateSubgraph
} from './state/graph-algos';

interface GraphViewProps {
}

const GraphView : React.FC <GraphViewProps> = ({
}) => {

    const socket = useSocket();

    const selected = useWorkbenchStateStore((state) => state.selected);

    const fgRef = useRef<any>();

    if (!selected) {
        return ( <div>No node selected.</div> );
    }

    const [view, setView] = useState<any>(undefined);

    useEffect(() => {

        const sg = createSubgraph();

        updateSubgraph(socket, selected.uri, sg).then(
            (sg) => {
                setView(sg);
            }
        );

    }, [selected]);

    if (!view)
        return ( <div>No data.</div> );

    const wrap = (s : string, w : number) => s.replace(
        new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n'
    );

    const nodeClick = (node : any) => {

        updateSubgraph(socket, node.id, view).then(
            (sg) => {
                setView(sg);
            }
        );
        
    };

    return (
        <>
            <Typography variant="h5" component="div" gutterBottom>
                {selected.label}
            </Typography>

            <Box>

            <ForceGraph3D
                width={1200}
                height={900}
                graphData={view}
                nodeLabel="label"
                nodeAutoColorBy="group"
                nodeThreeObject={(node : any) => {
                  const sprite = new SpriteText(wrap(node.label, 30));
                  sprite.color = 'white';
                  sprite.textHeight = 2;
                  return sprite;
                }}
                onNodeClick={nodeClick}

                linkDirectionalArrowLength={1.5}
                linkDirectionalArrowRelPos={1}
                linkThreeObjectExtend={true}
                linkThreeObject={(link : any) => {
                    const sprite = new SpriteText(wrap(link.label, 30));
                    sprite.color = 'white';
                    sprite.textHeight = 1.5;
                    return sprite;
                }}
                linkPositionUpdate={(sprite, { start, end }) => {
/*
                    const middlePos = Object.assign(
                        ...['x', 'y', 'z'].map(
                            c => ({
                                [c]: start[c] + (end[c] - start[c]) / 2
                            })
                        )
                    )
*/
                    const middlePos = {
                        x: start.x + (end.x - start.x) / 2,
                        y: start.y + (end.y - start.y) / 2,
                        z: start.z + (end.z - start.z) / 2,
                    };
                    Object.assign(sprite.position, middlePos);
                }}

                ref={fgRef}
                linkDirectionalParticleColor={() => '#a0a0c0'}
                linkDirectionalParticleWidth={0.8}
                linkHoverPrecision={2}
                onLinkClick={link => {
                    if (fgRef.current != undefined)
                        fgRef.current.emitParticle(link);
                }}
            />

            </Box>
        </>
    );

}

export default GraphView;

