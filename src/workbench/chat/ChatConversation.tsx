
import React from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import ChatHistory from './ChatHistory';
import InputArea from './InputArea';

import { useSocket } from '../socket/socket';
import { useWorkbenchStateStore } from '../state/WorkbenchState';
import { useProgressStateStore } from '../state/ProgressState';
import { useChatStateStore } from '../state/ChatState';
import { submitChat } from './submit';

interface ChatConversationProps {
};

const ChatConversation : React.FC <ChatConversationProps> = ({
}) => {

    const socket = useSocket();

    const addMessage = useChatStateStore((state) => state.addMessage);

    const input = useChatStateStore((state) => state.input);
    const setInput = useChatStateStore((state) => state.setInput);

    const addActivity = useProgressStateStore(
        (state) => state.addActivity
    );
    const removeActivity = useProgressStateStore(
        (state) => state.removeActivity
    );

    const setEntities = useWorkbenchStateStore((state) => state.setEntities);

    const submit = () => {
        submitChat(
            socket, input, addMessage, addActivity, removeActivity,
            setInput, setEntities,
        );
    }

    return (
        <>
            <Card
                className="chat-conversation"
                sx={{
                    margin: "0.5rem", height: "100%",
                    minWidth: '30rem', maxWidth: '60rem',
                    overflowY: 'auto'
                }}
            >

                <CardContent>
                    <ChatHistory/>
                    <InputArea
                        onSubmit={() => submit()}
                    />
                </CardContent>

            </Card>
        </>

    );

}

export default ChatConversation;

