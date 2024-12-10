
import React, { useState } from 'react';

import { Stack } from '@mui/material';

import ChatConversation from './ChatConversation';
import EntityList from './EntityList';
import { Entity } from './state/Entity';

interface ChatProps {
}

const Chat : React.FC <ChatProps> = ({
}) => {

    const [entities, setEntities] = useState<Entity[]>([]);

    return (
        <>
            <Stack direction="row">

                <ChatConversation
                    setEntities={setEntities}
                />

                <EntityList
                    entities={entities}
                />

            </Stack>
        </>

    );

}

export default Chat;

