
import React from 'react';

import { Box, Button, TextField } from '@mui/material';

import { Send } from '@mui/icons-material';

interface InputAreaProps {
    text : string;
    setText : (text : string) => void;
    onSubmit : () => void;
};

const InputArea : React.FC <InputAreaProps> = ({
    text, setText, onSubmit
}) => {

    return (
        <>
            <Box sx={{ display: 'flex', mt: 2 }} >
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type your message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <Button
                    type="submit"
                    variant="contained"
                    endIcon={<Send />}
                    onClick={()=>{onSubmit()}}
                    sx={{ ml: 1 }}
                >
                    Send
                </Button>
            </Box>
        </>

    );

}

export default InputArea;

