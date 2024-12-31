
import React from 'react';

import { Box, Button, Link, TextField, Paper } from '@mui/material';

import { useProgressStateStore } from '../state/ProgressState';

import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';

import { Send } from '@mui/icons-material';

import { useSocket } from '../socket/socket';
import { useWorkbenchStateStore } from '../state/WorkbenchState';
import { useSearchStateStore } from '../state/SearchState';
import {
    Row, getGraphEmbeddings, addRowLabels, addRowDefinitions,
    addRowEmbeddings, computeCosineSimilarity, sortSimilarity,
} from '../state/row';


interface SearchProps {
}

const Search : React.FC <SearchProps> = ({
}) => {

    const addActivity = useProgressStateStore(
        (state) => state.addActivity
    );
    const removeActivity = useProgressStateStore(
        (state) => state.removeActivity
    );

    const activity = useProgressStateStore((state) => state.activity);

    const socket = useSocket();

    const setSelected = useWorkbenchStateStore((state) => state.setSelected);
    const setTool = useWorkbenchStateStore((state) => state.setTool);

    const view = useSearchStateStore((state) => state.rows);
    const setView = useSearchStateStore((state) => state.setRows);

    const search = useSearchStateStore((state) => state.input);
    const setSearch = useSearchStateStore((state) => state.setInput);

    const select = (row : Row) => {
        setSelected({ uri: row.uri, label: row.label ? row.label : "n/a" });
        setTool("entity");
    }

    const submit : React.FormEventHandler<HTMLFormElement> = (e) => {

        const searchAct = "Search: " + search;
        addActivity(searchAct);

        socket.embeddings(search).then(
            getGraphEmbeddings(socket, 10, addActivity, removeActivity)
        ).then(
            addRowLabels(socket, addActivity, removeActivity)
        ).then(
            addRowDefinitions(socket, addActivity, removeActivity)
        ).then(
            addRowEmbeddings(socket, addActivity, removeActivity)
        ).then(
            computeCosineSimilarity(addActivity, removeActivity)
        ).then(
            sortSimilarity(addActivity, removeActivity)
        ).then(
            (x) => {
                setView(x);
                removeActivity(searchAct);
            }
        ).catch(
            (err) => {
                console.log("Error: ", err);
                removeActivity(searchAct);
            }
        );

        e.preventDefault();
    
    }

    const working = 0;

    return (
        <>

            <Box>

                <form onSubmit={submit} >

                    <Box sx={{ display: "flex", mt: 2, maxWidth: 800 }} >

                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Search term..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>

                            <Button
                                type="submit"
                                variant="contained"
                                disabled={working > 0}
                                endIcon={<Send/>}
                                sx={{ ml: 1 }}
                            >
                                Search
                            </Button>

                        </Box>

                    </Box>

                </form>

            </Box>

            {
                view.length > 0 &&
                    <TableContainer component={Paper} sx={{ mt: 4 }}>
                      <Table sx={{ minWidth: 450 }}
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
                                view.map((row : Row) => (
                                    <TableRow
                                      key={row.uri}
                                      sx={{
                                          '&:last-child td': { border: 0 },
                                          '&:last-child th': { border: 0 }
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
                                        <TableCell>
                                            {row.description}
                                        </TableCell>
                                        <TableCell>
                                            {row.similarity!.toFixed(2)}
                                        </TableCell>
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

export default Search;

