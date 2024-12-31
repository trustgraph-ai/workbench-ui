
import React, { useState, useRef, useEffect } from 'react';

import { ForceGraph2D } from 'react-force-graph';
import SpriteText from 'three-spritetext'

import { Box, Button, Link, TextField, Paper } from '@mui/material';

import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';

import { Send } from '@mui/icons-material';

import { useSocket } from '../socket/socket';
import { useWorkbenchStateStore } from '../state/WorkbenchState';
import { RDFS_LABEL, SKOS_DEFINITION } from '../state/knowledge-graph';

import { Value, Triple } from '../state/Triple';
import { Entity } from '../state/Entity';

import similarity from 'compute-cosine-similarity';

//import {TSNE} from '@keckelt/tsne';

interface DiscoverProps {
}

const Discover : React.FC <DiscoverProps> = ({
}) => {

    const socket = useSocket();

    const setSelected = useWorkbenchStateStore((state) => state.setSelected);
    const setTool = useWorkbenchStateStore((state) => state.setTool);

    const [view, setView] = useState<any>({nodes:[], links: []});

    const [search, setSearch] = useState<string>("");

    const select = (row : any) => {
        setSelected({ uri: row.uri, label: row.label });
        setTool("entity");
    }

    const submit : React.FormEventHandler<HTMLFormElement> = (e) => {

        socket.embeddings(search).then(

            // Take the embeddings, and lookup entities using graph
            // embeddings
            (vecs : number[][]) => {
                return socket.graphEmbeddingsQuery(vecs, 10).then(
                    (e) => { return { entities: e, target: vecs[0] }; }
                );
            }

        ).then(

            // For entities, lookup labels
            (ge : any) => {
                return Promise.all<any[]>(
                    ge.entities.map(
                        (ent : Value) =>
                            socket.triplesQuery(
                                ent,
                                { v: RDFS_LABEL, e: true, },
                                undefined,
                                1
                            ).then(
                                (t) => {
                                    if (t.length < 1) {
                                        return {
                                            uri: ent.v,
                                            label: "",
                                            target: ge.target,
                                        };
                                    } else {
                                        return {
                                            uri: ent.v,
                                            label: t[0].o.v,
                                            target: ge.target,
                                        };
                                    }
                                }
                            )
                    )
                );
            }

        ).then(

            // For entities, lookup labels
            (entities : any[]) => {
                return Promise.all<any>(
                    entities.map(
                        (ent : Value) =>
                            socket.triplesQuery(
                                { v: ent.uri, e : true },
                                { v: SKOS_DEFINITION, e: true, },
                                undefined,
                                1
                            ).then(
                                (t) => {
                                    if (t.length < 1) {
                                        return { ...ent, description: "" };
                                    } else {
                                        return {
                                            ...ent,
                                            description: t[0].o.v,
                                        };
                                    }
                                }
                            )
                    )
                );
            }

        ).then(

            // Compute an embedding for each entity based on its label
            (entities : any[]) => {
                return Promise.all<any[]>(
                    entities.map(
                        (ent : Entity) => {

                            let text = "";
                            if (ent.description != "")
                                text = ent.description;
                            else
                                text = ent.label;
                            
                            return socket.embeddings(text).then(
                                 (x) => {
                                     if (x && (x.length > 0)) {
                                         return {
                                             ...ent,
                                             embeddings: x[0]
                                         }
                                     } else {
                                         return {
                                             ...ent,
                                             embeddings: [],
                                         }
                                     };
                                 }
                            )
                        }
                    )
                );
            }

        ).then(
            (entities : any[]) =>
                entities.map(
                    (ent) => {
                        const sim = similarity(
                            ent.target, ent.embeddings
                        );
                        return {
                            uri: ent.uri,
                            label: ent.label,
                            description: ent.description,
                            similarity: sim.toFixed(2),
                        };
                    }
                )
        ).then(
            (entities : any[]) => {
                let arr = Array.from(entities);
                arr.sort(
                   (a, b) => (b.similarity - a.similarity)
                );
                return arr;
            }
        ).then(
            (x) => {
                setView(x);
            }
        );

        e.preventDefault();
    
    }

    const working = 0;

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
                view.length > 0 &&
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 450 }}
          size="small"
          aria-label="table of entities"
      >
        <TableHead>
          <TableRow>
            <TableCell>Entity</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Similarity</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
            {
                view.map((row) => (
                    <TableRow
                      key={row.uri}
                      sx={{
                          '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                        <TableCell component="th" scope="row">
                          <Link
                              align="left"
                              component="button"
                              onClick={
                                  () => select(row)
                              }
                          >
                              {row.label}
                          </Link>
                        </TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell>{row.similarity}</TableCell>
                    </TableRow>
                ))
            }
        </TableBody>
      </Table>
    </TableContainer>                
            }

        </>

    );

}

export default Discover;

