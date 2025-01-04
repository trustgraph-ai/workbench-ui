
import React, { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';

import Help from '@mui/icons-material/Help';

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
                      placeholder="Describe the data to explore..."
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

