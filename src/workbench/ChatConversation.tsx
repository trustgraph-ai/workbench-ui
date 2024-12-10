
import React, { useState } from 'react';

import {
    Card, CardContent, Typography, Box, Button, TextField
} from '@mui/material';

import { Send } from '@mui/icons-material';

import { useSocket } from './socket/socket';
import ChatHistory from './ChatHistory';
import { Message } from './state/Message';
import { Entity } from './state/Entity';
import { Value } from './state/Value';

interface ChatConversationProps {
    setEntities : (ents : Entity[]) => void;
};

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
      
    const onSubmit = (text : string) => {

        console.log("-> ", text);

        addMessage(text, "human");

/*
        socket.agent(
            text,
            (m) => addMessage("think: " + m, "ai"),
            (m) => addMessage("observe: " + m, "ai"),
            (m) => addMessage(m, "ai")
        );
*/

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
                const promises = Promise.all(
                    entities.map(
                        (ent : Value) =>
                            socket.triplesQuery(
                                ent,
                                undefined,
                                undefined,
                                1
                            )
                    )
                );
                return promises;
            }

        ).then(

            // Convert graph labels to an entity list
            (responses : any[]) => {
                for(let resp of responses) {
                    if (!resp.response) continue;
                    if (resp.response.length < 1) continue;

                    const ent = {
                        label: resp.response[0].o,
                        uri: resp.response[0].s,
                    };

console.log(ent);
// FIXME
//                    setEntities((e) => [ ...e, ent ]);

                }
            }

        );

// http://trustgraph.ai/e/remain

/*
        socket.triplesQuery({ v: text, e: true }).then(
            (res : number[][]) => {
                addMessage(JSON.stringify(res), "ai");
            }
        );
        */

    };

    return (
        <>
            <Card sx={{ width: "40rem", margin: "auto", mt: 4 }}>
                <CardContent>
                    <Typography variant="h5" component="div" gutterBottom>
                        AI Chat History
                    </Typography>
                    <ChatHistory messages={messages}/>
                    <Box sx={{ display: 'flex', mt: 2 }} >
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Type your message..."
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            endIcon={<Send />}
                            onClick={()=>{onSubmit(text)}}              
                            sx={{ ml: 1 }}
                        >
                            Send
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </>

    );

}

export default ChatConversation;

