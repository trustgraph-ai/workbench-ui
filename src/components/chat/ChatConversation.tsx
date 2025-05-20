
import React from 'react';

import { Box, Card } from '@chakra-ui/react';

import ChatHistory from './ChatHistory';
import InputArea from './InputArea';
import EntityList from '../common/EntityList';

import { useSocket } from '../../api/trustgraph/socket';
import { useWorkbenchStateStore } from '../../state/WorkbenchState';
import { useProgressStateStore } from '../../state/ProgressState';
import { useChatStateStore } from '../../state/ChatState';
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
    console.log("Input:", input);
        submitChat(
            socket, input, addMessage, addActivity, removeActivity,
            setInput, setEntities,
        );
    }

    return (
        <>
          <ChatHistory/>
          <InputArea onSubmit={() => submit()}
          />
          <EntityList />
        </>

    );

}

export default ChatConversation;

