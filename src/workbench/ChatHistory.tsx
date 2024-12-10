
import React, {  useEffect, useRef } from 'react';

import {
    List, ListItem, ListItemText, Avatar, Typography
} from '@mui/material';

import { SmartToy, Person } from '@mui/icons-material';

import { Message } from './state/Message';

interface ChatHistoryProps {
    messages: Message[];
}

const ChatHistory : React.FC <ChatHistoryProps> = ({
    messages
}) => {

    const scrollRef = useRef();

    const scrollToElement = () => {


// FIXME

/*
        const { current } = scrollRef;
        if (current !== null) {
            current!.scrollIntoView({behavior: "smooth"});
        }
*/
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

