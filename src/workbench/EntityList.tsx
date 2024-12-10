
import React, { useState, useEffect, useCallback, useRef } from 'react';

import {
    List, ListItem, ListItemText, Avatar, Card, CardContent,
    Typography, Box, Button, Stack, TextField
} from '@mui/material';

import {
    Send, SmartToy, Person
} from '@mui/icons-material';

import { Message } from './state/Message';

interface ChatProps {
    entities: string[];
}

const ChatHistory : React.FC <ChatProps> = ({
    messages
}) => {

    const scrollRef = useRef();

    const scrollToElement = () => {
        const { current } = scrollRef;
        if (current !== null) {
            current.scrollIntoView({behavior: "smooth"});
        }
    }

    useEffect(scrollToElement, [messages]);

    return (
        <List sx={{ height: 400, overflowY: 'auto' }}>
            {messages.map((message, ix) => {

                const bgcolor =
                    message.role === 'ai' ?
                    'primary.main' :
                    'secondary.main';

                const mr = message.role === 'human' ? 0 : 2;
                const ml = message.role === 'human' ? 2 : 0;
                const last = (ix == (messages.length - 1));
                const textAlign = message.role === 'human' ? 'right' : 'left';
                const flexDir =
                    message.role === 'human' ?
                    'row-reverse' :
                    'row';

                return (
                    <ListItem
                        key={ix}
                        alignItems="flex-start"
                        sx={{
                            flexDirection: flexDir,
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
                            sx={{ textAlign: textAlign }}
                            ref={last ? scrollRef : null}
                        />
                   </ListItem>
             )})}
        </List>
    );

}

export default ChatHistory;

