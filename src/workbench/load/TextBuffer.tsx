
import React from 'react';

import { Box, TextField } from '@mui/material';

interface TextBufferProps {
    value : string,
    setValue : (value : string) => void;
}

const TextBuffer : React.FC<TextBufferProps> = ({
    value, setValue,
}) => {

    return (
        <Box sx={{ m: 2 }}>
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

