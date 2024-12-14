
import React from 'react';

import { Stack } from '@mui/material';

import ChatConversation from './ChatConversation';

interface ChatProps {
}

const Chat : React.FC <ChatProps> = ({
}) => {

    return (
        <>
            <Stack direction="row">

                <ChatConversation
                />

            </Stack>
        </>

    );

}

export default Chat;

