
import React, {  useEffect, useRef } from 'react';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Person from '@mui/icons-material/Person';

import { useChatStateStore } from '../state/ChatState';

interface ChatHistoryProps {
}

const ChatHistory : React.FC <ChatHistoryProps> = ({
}) => {

    const messages = useChatStateStore((state) => state.messages);

    const scrollRef = useRef<HTMLInputElement>(null);

    const scrollToElement = () => {

        const { current } = scrollRef;
        if (current !== null) {
            current.scrollIntoView({behavior: "smooth"});
        }

    }

    useEffect(scrollToElement, [messages]);

    return (
        <List
            sx={{
                height: '100%',
                overflowY: 'auto'
            }}
        >

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
                            { message.role === 'ai' ? <img
                        src="./tg.svg"
                        alt="Trustgraph logo"
                        height="45"
                    /> : <Person/> }
                        </Avatar>

                        <ListItemText
                            primary={message.role === 'ai' ? 'TrustGraph' : 'User'}
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

