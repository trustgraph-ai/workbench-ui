
import React, { useRef, useState } from 'react';

import {
    Box, Button, TextField, CircularProgress, IconButton
} from '@mui/material';

import { Send, Help } from '@mui/icons-material';
import { useProgressStateStore } from '../state/ProgressState';
import { useChatStateStore } from '../state/ChatState';

import ChatHelp from './ChatHelp';
import ProgressSubmitButton from '../ProgressSubmitButton';

interface InputAreaProps {
    onSubmit : () => void;
};

const InputArea : React.FC <InputAreaProps> = ({
    onSubmit
}) => {

    const input = useChatStateStore((state) => state.input);
    const setInput = useChatStateStore((state) => state.setInput);
    const activity = useProgressStateStore((state) => state.activity);

    const inputRef = useRef<HTMLInputElement>(null);

    const submit : React.FormEventHandler<HTMLFormElement> = (e) => {
        onSubmit();
        if (inputRef.current) {
            inputRef.current.focus();
        }
        e.preventDefault();
    }

    const [help, setHelp] = useState<boolean>(false);

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
            <ChatHelp
                open={help} onClose={() => setHelp(false)}
            />
        </>

    );

}

export default InputArea;

