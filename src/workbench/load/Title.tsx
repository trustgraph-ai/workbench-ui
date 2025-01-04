
import React from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import { useLoadStateStore } from '../state/LoadState';

interface TitleProps {
}

const Title : React.FC<TitleProps> = ({
}) => {

    const value = useLoadStateStore((state) => state.title);
    const setValue = useLoadStateStore((state) => state.setTitle);

    return (
        <>

            <Box sx={{ m: 2 }}>

                <TextField
                    sx={{
                        width: '50rem',
                    }}
                    label="Title (optional)"
                    helperText="File title (not available for loading multiple files at once)"
                    defaultValue={value}
                    onChange={(e) => setValue(e.target.value)}
                />

            </Box>

        </>

    );

}

export default Title;

