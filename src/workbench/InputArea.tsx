
import React from 'react';

import { Box, Button, TextField } from '@mui/material';

import { Send } from '@mui/icons-material';
import { useWorkbenchStateStore } from './state/WorkbenchState';

interface InputAreaProps {
    onSubmit : () => void;
};

const InputArea : React.FC <InputAreaProps> = ({
    onSubmit
}) => {

    const input = useWorkbenchStateStore((state) => state.input);
    const setInput = useWorkbenchStateStore((state) => state.setInput);
    const working = useWorkbenchStateStore((state) => state.working);

    return (
        <>
            <Box sx={{ display: 'flex', mt: 2 }} >
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button
                    type="submit"
                    variant="contained"
                    disabled={working}
                    endIcon={<Send />}
                    onClick={()=>{onSubmit()}}
                    sx={{ ml: 1 }}
                >
                    Send
                </Button>
                {working}
            </Box>
        </>

    );

}

export default InputArea;

