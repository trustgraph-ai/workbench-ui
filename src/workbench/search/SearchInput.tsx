
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Help from '@mui/icons-material/Help';

import { useProgressStateStore } from '../state/ProgressState';
import { useSearchStateStore } from '../state/SearchState';
import SearchHelp from './SearchHelp';
import ProgressSubmitButton from '../ProgressSubmitButton';

interface SearchInputProps {
    submit : React.FormEventHandler<HTMLFormElement>;
}

const SearchInput : React.FC <SearchInputProps> = ({
    submit,
}) => {

    const activity = useProgressStateStore((state) => state.activity);

    const [help, setHelp] = useState<boolean>(false);

    const search = useSearchStateStore((state) => state.input);
    const setSearch = useSearchStateStore((state) => state.setInput);

    return (
        <>

            <Box>

                <form onSubmit={submit} >

                    <Box sx={{ display: "flex", mt: 2, maxWidth: 800 }} >

                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Search the data for a term or phrase..."
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

