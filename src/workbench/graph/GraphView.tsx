
import React, { useState, useEffect, useRef } from 'react';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';

import { useResizeDetector } from 'react-resize-detector';

import { ForceGraph3D } from 'react-force-graph';
import SpriteText from 'three-spritetext'

import { useProgressStateStore } from '../state/ProgressState';
import { useSocket } from '../socket/socket';
import { useWorkbenchStateStore } from '../state/WorkbenchState';
import { createSubgraph, updateSubgraph } from '../state/knowledge-graph-viz';
import CenterSpinner from '../CenterSpinner';
import HelpButton from './HelpButton';

interface GraphViewProps {
}

const GraphView : React.FC <GraphViewProps> = ({
}) => {

    const theme = useTheme();

    const setError = useProgressStateStore((state) => state.setError);

    const addActivity = useProgressStateStore(
        (state) => state.addActivity
    );
    const removeActivity = useProgressStateStore(
        (state) => state.removeActivity
    );

    const socket = useSocket();

    const selected = useWorkbenchStateStore((state) => state.selected);

    const fgRef = useRef<any>();

    const { width, height, ref } = useResizeDetector(
        {
        }
    );

    if (!selected) {
        return (
            <Box>
                <CenterSpinner/>
                <Alert severity="info" variant="outlined">
                    No data to view. Try Chat or Search to find data.
                </Alert>
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
                setError(err.toString());
                removeActivity(act);
            }
        );

    }, [selected]);

    if (!view)
        return (
            <Box>
                <CenterSpinner/>
                <Alert severity="info" variant="outlined">
                    No data to view. Try Chat or Search to find data.
                </Alert>
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
                setError(err.toString());
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

                <HelpButton/>

            </Box>

            <Box
                ref={ref}
                sx={{
                   border: 1,
                   borderColor: theme.palette.grey[800],
                    width: "calc(100% - 0.5rem)",
                    height: "calc(100% - 6rem)",
                }}
            >

            <ForceGraph3D
                width={width}
                height={height}
                graphData={view}
                nodeOpacity={0.8}
                nodeLabel="label"
                enableNodeDrag={true}
                nodeColor={theme.palette.primary.main}
                backgroundColor={theme.palette.background.paper}
                nodeThreeObject={(node : any) => {
                  const sprite = new SpriteText(wrap(node.label, 30));
//                  sprite.material.depthWrite = false;
                  sprite.color = theme.palette.secondary.main;
                  sprite.textHeight = 4;
                  return sprite;
                }}
                onNodeClick={nodeClick}
                onNodeDragEnd={(node : any) => {
                    node.fx = node.x;
                    node.fy = node.y;
                    node.fz = node.z;
                  }}

                linkDirectionalArrowLength={2.5}
                linkDirectionalArrowRelPos={0.75}
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
                linkDirectionalParticleColor={
                    () => theme.palette.primary.main
                }
                linkDirectionalParticleWidth={1.4}
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

