
import React, { useRef } from 'react';

import { Box, Button, TextField, CircularProgress } from '@mui/material';

import { Send } from '@mui/icons-material';
import { useWorkbenchStateStore } from '../state/WorkbenchState';

interface InputAreaProps {
    onSubmit : () => void;
};

const InputArea : React.FC <InputAreaProps> = ({
    onSubmit
}) => {

    const input = useWorkbenchStateStore((state) => state.input);
    const setInput = useWorkbenchStateStore((state) => state.setInput);
    const working = useWorkbenchStateStore((state) => state.working);

    const inputRef = useRef<HTMLInputElement>(null);

    const submit : React.FormEventHandler<HTMLFormElement> = (e) => {
        onSubmit();
        if (inputRef.current) {
            inputRef.current.focus();
        }
        e.preventDefault();
    }

    return (
        <>
            <form onSubmit={submit} >

                <Box sx={{ display: 'flex', mt: 2 }} >

                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Type your message..."
                      value={input}
                      inputRef={inputRef}
                      onChange={(e) => setInput(e.target.value)}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>

                        <Box sx={{ m: 1, position: 'relative' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={working > 0}
                                endIcon={<Send/>}
                                sx={{ ml: 1 }}
                            >
                                Send
                            </Button>
                        </Box>
                        <Box sx={{ m: 1, position: 'relative' }}>

                            {(working > 0) && <CircularProgress
                                size={24}
                                sx={{
                                    color: 'gray',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-75px',
                                  }}
                            />
                            }
                        </Box>

                    </Box>
                </Box>
            </form>

        </>

    );

}

export default InputArea;

