
import React, { useState, useRef, useEffect } from 'react';

import { ForceGraph2D } from 'react-force-graph';
import SpriteText from 'three-spritetext'

import { Box, Button, TextField } from '@mui/material';

import { Send } from '@mui/icons-material';

import { useSocket } from '../socket/socket';
//import { useWorkbenchStateStore } from '../state/WorkbenchState';
import { RDFS_LABEL } from '../state/knowledge-graph';

import { Value, Triple } from '../state/Triple';
import { Entity } from '../state/Entity';

import similarity from 'compute-cosine-similarity';

//import {TSNE} from '@keckelt/tsne';

interface DiscoverProps {
}

const Discover : React.FC <DiscoverProps> = ({
}) => {

    const fgRef = useRef<any>();

    const socket = useSocket();

//    const selected = useWorkbenchStateStore((state) => state.selected);
//    const setTool = useWorkbenchStateStore((state) => state.setTool);

    const [view, setView] = useState<any>({nodes:[], links: []});

    const [search, setSearch] = useState<string>("");

//    const graphView = () => {
//        setTool("graph");
//    };

    useEffect(() => {
        if (fgRef.current) {
            fgRef.current.d3Force('charge').strength(-35);
            fgRef.current.d3Force('center').strength(0.9);
        }
    }, []);

    const submit : React.FormEventHandler<HTMLFormElement> = (e) => {

        socket.embeddings(search).then(

            // Take the embeddings, and lookup entities using graph
            // embeddings
            (vecs : number[][]) => {
                return socket.graphEmbeddingsQuery(vecs, 15);
            }

        ).then(

            // For entities, lookup labels
            (entities : Value[]) => {
                return Promise.all<Triple[]>(
                    entities.map(
                        (ent : Value) =>
                            socket.triplesQuery(
                                ent,
                                { v: RDFS_LABEL, e: true, },
                                undefined,
                                1
                            )
                    )
                );
            }

        ).then(

            // Convert graph labels to an entity list
            (responses : Triple[][]) : Entity[] => {

                let entities : Entity[] = [];

                for(let resp of responses) {

                    if (!resp) continue;
                    if (resp.length < 1) continue;

                    const ent : Entity = {
                        label: resp[0].o.v,
                        uri: resp[0].s.v,
                    };

                    entities.push(ent);

                }

                return entities;

            }

        ).then(

            (t : Entity[]) => {
                return Promise.all<any[]>(
                    t.map(
                        (ent : Entity) =>
                            socket.embeddings(ent.label).then(
                                 (x) => {
                                     if (x && (x.length > 0)) {
                                         return {
                                             uri: ent.uri,
                                             label: ent.label,
                                             embeddings: x[0]
                                         }
                                     } else {
                                         return {
                                             uri: ent.uri,
                                             label: ent.label,
                                         }
                                     };
                                 }
                            )
                    )
                );
            }

        ).then(
            (entities) => {

                console.log(entities);

                let nearest : { [k : number] : number } = {};

                entities.forEach(
                    (ent, ix) => {

                        let candidate = -1;
                        let near = 1000000;

                        entities.forEach(
                            (ent2, ix2) => {

                                const sim = similarity(
                                    ent.embeddings, ent2.embeddings
                                );

                                if (sim < near) {
                                    near = sim;
                                    candidate = ix2;
                                }

                            }
                        );

                        nearest[ix] = candidate;

                    }
                );

                console.log(nearest);

                const nodes = entities.map(
                    (ent) => {
                        return { id: ent.uri, label: ent.label };
                    }
                );

                const edges = Object.keys(nearest).map(
                    (src) => {
                        return {
                            source: entities[src].uri,
                            target: entities[nearest[src]].uri,
                            value: 1,
                            group: 1,
                        };
                    }
                );

                console.log("N", nodes);
                console.log("E", edges);

                setView({ nodes: nodes, links: edges });

            }
        );

        e.preventDefault();
    
    }

    const working = 0;

    const wrap = (s : string, w : number) => s.replace(
        new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n'
    );

    const nodeClick = (node : any) => {
    console.log(node);
    };

    return (
        <>

            <Box>

                <form onSubmit={submit} >

                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Search term..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={working > 0}
                        endIcon={<Send/>}
                        sx={{ ml: 1 }}
                    >
                        Search
                    </Button>

                </form>

            </Box>

            {
                view &&
                <Box>

            <ForceGraph2D
                ref={fgRef}
                width={900}
                height={600}
                graphData={view}
                nodeLabel="label"
                nodeAutoColorBy="group"

              nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.label;
                const fontSize = 16/globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth, fontSize].map(
                    n => n + fontSize * 0.2
                );

                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(
                    node.x - bckgDimensions[0] / 2,
                    node.y - bckgDimensions[1] / 2,
                    ...bckgDimensions
                );

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(40, 80, 180, 1)';
                ctx.fillText(label, node.x, node.y);

                node.__bckgDimensions = bckgDimensions;
              }}

                onNodeClick={nodeClick}

                linkDirectionalArrowLength={1.5}
                linkDirectionalArrowRelPos={1}
                linkPositionUpdate={(sprite, { start, end }) => {
                    const middlePos = {
                        x: start.x + (end.x - start.x) / 2,
                        y: start.y + (end.y - start.y) / 2,
                        z: start.z + (end.z - start.z) / 2,
                    };
                    Object.assign(sprite.position, middlePos);
                }}
            />

                </Box>
            }

        </>

    );

}

export default Discover;

