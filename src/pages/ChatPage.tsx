
import React from 'react';

import ChatConversation from '../components/chat/ChatConversation';
import PageHeader from '../components/common/PageHeader';

const Chat : React.FC <{}> = ({
}) => {

    return (
        <>
            <PageHeader
              title="Graph RAG chat"
              description="Converse with the knowledge-graph assistant in natural language"
            />

            <ChatConversation/>

        </>

    );

}

export default Chat;

