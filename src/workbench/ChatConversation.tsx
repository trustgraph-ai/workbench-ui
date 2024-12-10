
import React, { useState, useEffect, useCallback, useRef } from 'react';

import {
    List, ListItem, ListItemText, Avatar, Card, CardContent,
    Typography, Box, Button, Stack, TextField
} from '@mui/material';
import { Send, SmartToy, Person } from '@mui/icons-material';

import { useSocket } from './socket/socket';
import ChatHistory from './ChatHistory';
import { Message } from './state/Message';

interface ChatConversationProps {
};

const ChatConversation : React.FC <ChatConversationProps> = ({
}) => {

    const socket = useSocket();

    // For scrolling into view
    const scrollRef = useRef();

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
        socket.textComplete(text).then(
            (response : string) => addMessage(response, "ai")
        );
*/
/*
        socket.graphRag(text).then(
            (response : string) => addMessage(response, "ai")
        );
*/
/*
        socket.agent(
            text,
            (m) => addMessage("think: " + m, "ai"),
            (m) => addMessage("observe: " + m, "ai"),
            (m) => addMessage(m, "ai")
        );
*/

/*
        socket.embeddings(text).then(
            (vecs : number[][]) => {
//                addMessage(JSON.stringify(vec), "asdai");
                addMessage("[vec]", "ai");

                socket.graphEmbeddingsQuery(vecs, 5).then(
                   (ents) => {
                       for(let ent of ents) {
                           addMessage(ent.v, "ai");
                       }
                   }
                );
            }
        );
    */

// http://trustgraph.ai/e/remain

        socket.triplesQuery({ v: text, e: true }).then(
            (res : number[][]) => {
                addMessage(JSON.stringify(res), "ai");
            }
        );

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

