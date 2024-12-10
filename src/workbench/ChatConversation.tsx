
import React, { useState, Dispatch, SetStateAction } from 'react';

import { Card, CardContent, Typography } from '@mui/material';

import ChatHistory from './ChatHistory';
import InputArea from './InputArea';

import { useSocket } from './socket/socket';
import { Message } from './state/Message';
import { Entity } from './state/Entity';
import { Triple, Value } from './socket/trustgraph-socket';


interface ChatConversationProps {
    setEntities : Dispatch<SetStateAction<Entity[]>>;
};

const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label"

const ChatConversation : React.FC <ChatConversationProps> = ({
    setEntities
}) => {

    const socket = useSocket();

    const [text, setText] = useState<string>("2+5");

    const [messages, setMessages] = useState<Message[]>([
        {
            role: "ai",
            text: "Hello and welcome!",
        },
    ]);

    const addMessage = (text : string, role : string) => {
        setMessages(
            (msgs) => [
                ...msgs,
                {
                    role: role,
                    text: text,
                },
            ]
        );
    };
      
    const onSubmit = () => {

        console.log("-> ", text);

        addMessage(text, "human");

        socket.agent(
            text,
            (m) => addMessage("\u{1f914} " + m, "ai"),
            (m) => addMessage("\u{1f575}\u{fe0f} " + m, "ai"),
            (m) => addMessage(m, "ai")
        );

        // Empty entity list
        setEntities([]);

        // Take the text, and get embeddings
        socket.embeddings(text).then(

            // Take the embeddings, and lookup entities using graph
            // embeddings
            (vecs : number[][]) => socket.graphEmbeddingsQuery(vecs, 5)

        ).then(

            // For entities, lookup labels
            (entities : Value[]) => {
                return Promise.all<Triple[]>(
                    entities.map(
                        (ent : Value) =>
                            socket.triplesQuery(
                                ent,
                                { v: RDFS_LABEL, e: true, },
                                undefined,
                                1
                            )
                    )
                );
            }

        ).then(

            // Convert graph labels to an entity list
            (responses : Triple[][]) => {

                for(let resp of responses) {

                    if (!resp) continue;
                    if (resp.length < 1) continue;

                    const ent : Entity = {
                        label: resp[0].o.v,
                        uri: resp[0].s.v,
                    };

                    setEntities((e : Entity[]) => [ ...e, ent ]);

                }
            }

        );

    };

    return (
        <>
            <Card sx={{ width: "40rem", margin: "0.5rem" }}>
                <CardContent>
                    <Typography variant="h5" component="div" gutterBottom>
                        AI Chat History
                    </Typography>
                    <ChatHistory messages={messages}/>
                    <InputArea
                        text={text}
                        setText={setText}
                        onSubmit={onSubmit}
                    />
                </CardContent>
            </Card>
        </>

    );

}

export default ChatConversation;

