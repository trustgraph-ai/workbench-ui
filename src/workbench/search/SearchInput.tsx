
import React, { useState } from 'react';

import {
    Box, Link, TextField, Paper, IconButton
} from '@mui/material';

import { useProgressStateStore } from '../state/ProgressState';

import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';

import { Help } from '@mui/icons-material';

import { useSocket } from '../socket/socket';
import { useWorkbenchStateStore } from '../state/WorkbenchState';
import { useSearchStateStore } from '../state/SearchState';
import {
    Row, getGraphEmbeddings, addRowLabels, addRowDefinitions,
    addRowEmbeddings, computeCosineSimilarity, sortSimilarity,
} from '../state/row';

import SearchHelp from './SearchHelp';
import ProgressSubmitButton from '../ProgressSubmitButton';

interface SearchInputProps {
    submit : () => void;
}

const SearchInput : React.FC <SearchInputProps> = ({
    submit,
}) => {

    const addActivity = useProgressStateStore(
        (state) => state.addActivity
    );
    const removeActivity = useProgressStateStore(
        (state) => state.removeActivity
    );
    const activity = useProgressStateStore((state) => state.activity);

    const [help, setHelp] = useState<boolean>(false);

    const socket = useSocket();

    const setSelected = useWorkbenchStateStore((state) => state.setSelected);
    const setTool = useWorkbenchStateStore((state) => state.setTool);
    const setEntities = useWorkbenchStateStore((state) => state.setEntities);

    const view = useSearchStateStore((state) => state.rows);
    const setView = useSearchStateStore((state) => state.setRows);

    const search = useSearchStateStore((state) => state.input);
    const setSearch = useSearchStateStore((state) => state.setInput);

    const select = (row : Row) => {
        setSelected({ uri: row.uri, label: row.label ? row.label : "n/a" });
        setTool("entity");
    }

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

                        <IconButton
                            aria-label="help"
                            color="primary"
                            size="large"
                            onClick={() => setHelp(true)}
                        >
                            <Help fontSize="inherit"/>
                        </IconButton>

                        <ProgressSubmitButton
                            disabled={activity.size > 0}
                            working={activity.size > 0}
                        />

                    </Box>

                </form>

                <SearchHelp
                    open={help} onClose={() => setHelp(false)}
                />

            </Box>

        </>

    );

}

export default SearchInput;

