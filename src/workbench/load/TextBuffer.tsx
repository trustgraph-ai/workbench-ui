
import React from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

import { useLoadStateStore } from '../state/LoadState';

interface TextBufferProps {
    submit : () => void;
}

const TextBuffer : React.FC<TextBufferProps> = ({
    submit,
}) => {

    const value = useLoadStateStore((state) => state.text);
    const setValue = useLoadStateStore((state) => state.setText);
    const textUploads = useLoadStateStore((state) => state.textUploads);

    return (
        <Box sx={{ m: 1 }}>

            <Box
                sx={{
                    ml: 1, mt: 1, mb: 2,
                }}
            >

                <Button
                    variant="contained"
                    disabled={value.length < 1}
                    onClick={submit}
                >
                    Submit
                </Button>

            {
                (textUploads > 0) &&
                <Box sx={{ml: 1, mt: 1, mb: 2}}>
                    <Alert severity="success">
                        {textUploads} text uploads
                    </Alert>
                </Box>
            }
            </Box>

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

