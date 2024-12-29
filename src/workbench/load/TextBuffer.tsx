
import React from 'react';

import { Box, TextField, Button } from '@mui/material';

interface TextBufferProps {
    value : string,
    setValue : (value : string) => void;
    submit : () => void;
}

const TextBuffer : React.FC<TextBufferProps> = ({
    value, setValue, submit,
}) => {

    return (
        <Box sx={{ m: 2 }}>
            <Button variant="contained" sx={{ m: 1 }} onClick={submit}>
                Submit
            </Button>
            <TextField
                fullWidth
                defaultValue={value}
                onChange={(e) => setValue(e.target.value)}
                label="Text content"
                multiline
                rows={15}
            />
        </Box>
    );

}

export default TextBuffer;

