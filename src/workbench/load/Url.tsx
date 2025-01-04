
import React from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import { useLoadStateStore } from '../state/LoadState';

interface UrlProps {
}

const Url : React.FC<UrlProps> = ({
}) => {

    const value = useLoadStateStore((state) => state.url);
    const setValue = useLoadStateStore((state) => state.setUrl);

    return (
        <>

            <Box sx={{ m: 2 }}>

                <TextField
                    sx={{
                        width: '50rem',
                    }}
                    label="URL (optional)"
                    helperText="Source URL (not available for loading multiple files at once)"
                    defaultValue={value}
                    onChange={(e) => setValue(e.target.value)}
                />

            </Box>

        </>

    );

}

export default Url;

