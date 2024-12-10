
import React, { useState, useEffect, useCallback, useRef } from 'react';

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

//        socket.textComplete(text).then(
//            (response : string) => addMessage(response, "ai")
//        );

//        socket.graphRag(text).then(
//            (response : string) => addMessage(response, "ai")
//        );


        socket.agent(
            text,
            (m) => addMessage("think: " + m, "ai"),
            (m) => addMessage("observe: " + m, "ai"),
            (m) => addMessage(m, "ai")
        );

    };

    const scrollToElement = () => {
        const { current } = scrollRef;
        if (current !== null) {
            current.scrollIntoView({behavior: "smooth"});
        }
    }

    useEffect(scrollToElement, [messages]);

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
                            const last = (ix == (messages.length - 1));
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
                                        ref={last ? scrollRef : null}
                                    />
                               </ListItem>
                         )})}
                    </List>
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

export default Chat;

