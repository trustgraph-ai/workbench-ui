
import React from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { useLoadStateStore } from '../state/LoadState';

interface TextBufferProps {
    submit : () => void;
}

const TextBuffer : React.FC<TextBufferProps> = ({
    submit,
}) => {

    const value = useLoadStateStore((state) => state.text);
    const setValue = useLoadStateStore((state) => state.setText);

    return (
        <Box sx={{ m: 2 }}>

            <Button
                variant="contained"
                sx={{
                    ml: 1, mt: 1, mb: 4,
                }}
                disabled={value.length < 1}
                onClick={submit}
            >
                Submit
            </Button>

            <TextField
                fullWidth
                value={value}
                onChange={(e) => setValue(e.target.value)}
                label="Text content"
                multiline
                rows={15}
            />

        </Box>
    );

}

export default TextBuffer;

