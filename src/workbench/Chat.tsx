
import React, { useState, useEffect, useCallback } from 'react';

import {
    List, ListItem, ListItemText, Avatar, Card, CardContent,
    Typography, Box, Button, Stack, TextField
} from '@mui/material';

import {
    Send, SmartToy, Person
} from '@mui/icons-material';

import { useSocket } from './socket/socket';

interface ChatProps {
}

interface Message {
    role : string;
    text : string;
};

const Chat : React.FC <ChatProps> = ({
}) => {

    const socket = useSocket();

    const [text, setText] = useState<string>("hello world");

    const [messages, setMessages] = useState<Message[]>([
        {
            role: "ai",
            text: "Hello and welcome!",
        },
    ]);

    const onSubmit = (text : string) => {
        console.log("-> ", text);
        setMessages([
            ...messages,
            {
                role: "human",
                text: text,
            },
        ]);
        socket.send(text);
    };

    const onMessage = (text : any) => {
        console.log("<- ", text);
        setMessages([
            ...messages,
            {
                role: "ai",
                text: text,
            },
        ]);
    };
       
    useEffect(() => {
        socket.addEventListener("text-completion", onMessage);
        return () => {
            socket.removeEventListener("text-completion", onMessage);
        }
    });

    return (
        <>
            <Card sx={{ width: "40rem", margin: "auto", mt: 4 }}>
                <CardContent>
                    <Typography variant="h5" component="div" gutterBottom>
                        AI Chat History
                    </Typography>
                    <List sx={{ height: 400, overflowY: 'auto' }}>
                        {messages.map((message, ix) => {
                            const bgcolor = message.role === 'ai' ? 'primary.main' : 'secondary.main';
                            const mr = message.role === 'human' ? 0 : 2;
                            const ml = message.role === 'human' ? 2 : 0;

                            return (
                                <ListItem
                                    key={ix}
                                    alignItems="flex-start"
                                    sx={{
                                        flexDirection: message.role === 'human' ? 'row-reverse' : 'row'
                                    }}
                                >
                                    <Avatar
                                        sx={{ bgcolor: bgcolor, mr: mr, ml: ml }}
                                    >
                                        { message.role === 'ai' ? <SmartToy/> : <Person/> }
                                    </Avatar>

                            <ListItemText
                                primary={message.role === 'ai' ? 'AI' : 'You'}
                                secondary={
                                  <Typography
                                    sx={{ display: 'inline' }}
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                  >
                                    {message.text}
                                  </Typography>
                                }
                                sx={{ textAlign: message.role === 'human' ? 'right' : 'left' }}
                              />
                            </ListItem>
                          )})}
                    </List>
                    <Box sx={{ display: 'flex', mt: 2 }}>
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

export default Chat;

