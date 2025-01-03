
import React, { useState, useEffect, useRef } from 'react';

import { Typography, Box, IconButton } from '@mui/material';
import { Help } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

import { ForceGraph3D } from 'react-force-graph';
import SpriteText from 'three-spritetext'

import { useProgressStateStore } from '../state/ProgressState';
import { useSocket } from '../socket/socket';
import { useWorkbenchStateStore } from '../state/WorkbenchState';
import {
    createSubgraph, updateSubgraph
} from '../state/knowledge-graph-viz';

import GraphHelp from './Help';
import CenterSpinner from '../CenterSpinner';

interface GraphViewProps {
}

const GraphView : React.FC <GraphViewProps> = ({
}) => {

    const theme = useTheme();

    const addActivity = useProgressStateStore(
        (state) => state.addActivity
    );
    const removeActivity = useProgressStateStore(
        (state) => state.removeActivity
    );

    const [help, setHelp] = React.useState<boolean>(false);

    const socket = useSocket();

    const selected = useWorkbenchStateStore((state) => state.selected);

    const fgRef = useRef<any>();

    if (!selected) {
        return (
            <Box>
                <CenterSpinner/>
                <Typography variant='h6' color='primary'>
                    No data to view. Try Chat or Search to find data.
                </Typography>
            </Box>
        );
    }

    const [view, setView] = useState<any>(undefined);

    useEffect(() => {

        const act = "Build subgraph: " + selected.label;
        addActivity(act);

        const sg = createSubgraph();

        updateSubgraph(
            socket, selected.uri, sg, addActivity, removeActivity
        ).then(
            (sg) => {
                setView(sg);
                removeActivity(act);
            }
        ).catch(
            (err) => {
                console.log("Error: ", err);
                removeActivity(act);
            }
        );

    }, [selected]);

    if (!view)
        return (
            <Box>
                <CenterSpinner/>
                <Typography variant='h6' color='primary'>
                    No data to view. Try Chat or Search to find data.
                </Typography>
            </Box>
        );

    const wrap = (s : string, w : number) => s.replace(
        new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n'
    );

    const nodeClick = (node : any) => {

        const act = "Update subgraph: " + node.label;
        addActivity(act);

        updateSubgraph(
            socket, node.id, view, addActivity, removeActivity
        ).then(
            (sg) => {
                setView(sg);
                removeActivity(act);
            }
        ).catch(
            (err) => {
                console.log("Error: ", err);
                removeActivity(act);
            }
        );
        
    };

    return (
        <>

            <Box sx={{ display: "flex", alignItems: 'center', mt: 2}}>

                <Typography variant="h5" component="div" sx={{m: 0, p: 0}}>
                    {selected.label}
                </Typography>

                <CenterSpinner/>

                <IconButton
                    aria-label="help"
                    color="primary"
                    size="large"
                    onClick={() => setHelp(true)}
                >
                    <Help fontSize="inherit"/>
                </IconButton>

            </Box>
            <Box>

            <GraphHelp
                open={help} onClose={() => setHelp(false)}
            />

            <ForceGraph3D
                width={1200}
                height={900}
                graphData={view}
                nodeOpacity={0.8}
                nodeLabel="label"
                nodeColor={theme.palette.primary.main}
                backgroundColor={theme.palette.background.paper}
                nodeThreeObject={(node : any) => {
                  const sprite = new SpriteText(wrap(node.label, 30));
                  sprite.material.depthWrite = false;
                  sprite.color = theme.palette.secondary.main;
                  sprite.textHeight = 4;
                  return sprite;
                }}
                onNodeClick={nodeClick}

                linkDirectionalArrowLength={2.5}
                linkDirectionalArrowRelPos={0.5}
                linkOpacity={0.6}
                linkColor={theme.palette.grey[500]}
                linkWidth="2"
                linkThreeObjectExtend={true}
                linkThreeObject={(link : any) => {
                    const sprite = new SpriteText(wrap(link.label, 30));
                    sprite.color = theme.palette.grey[500];
                    sprite.textHeight = 2.0;
                    return sprite;
                }} 
                linkPositionUpdate={(sprite, { start, end }) => {
                    const middlePos = {
                        x: start.x + (end.x - start.x) / 2,
                        y: start.y + (end.y - start.y) / 2,
                        z: start.z + (end.z - start.z) / 2,
                    };
                    Object.assign(sprite.position, middlePos);
                }} 

                ref={fgRef}
                linkDirectionalParticleColor={() => '#65c97a'}
                linkDirectionalParticleWidth={2.0}
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

