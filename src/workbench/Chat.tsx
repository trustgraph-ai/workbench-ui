
import React, { useState, useEffect, useCallback } from 'react';

import {
    List, ListItem, ListItemText, Avatar, Card, CardContent,
    Typography, Box, Button, Stack, TextField
} from '@mui/material';

import {
    Send, SmartToy, Person
} from '@mui/icons-material';

import { useSocket } from './socket/Socket';

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
            text: "bunch",
        },
        {
            role: "human",
            text: "hello there",
        },
        {
            role: "ai",
            text: "bunch",
        },
        {
            role: "human",
            text: "hello there",
        }
    ]);

    const handleSendMessage = useCallback((message : any) => {
        console.log("MESSAGE:", message);
        if (message.data) {
            console.log(message.data);
            const obj = JSON.parse(message.data);
            console.log(obj.response.response);
        }
    }, []);

//console.log(messages);

    const onMessage = () => {
        console.log("Text:", text);
        setMessages([
            ...messages,
            {
                role: "ai",
                text: "message",
            },
            {
                role: "human",
                text: "message",
            }
        ]);

/*
        socket.send(
            JSON.stringify({
                "id": "12314",
                "service": "text-completion",
                "request": {
                    "system": "You are a helpful assistant.",
                    "prompt": text
                }
            })
        );
*/
    }

    useEffect(() => {
        socket.addEventListener("message", onMessage);

        return () => {
            socket.removeEventListener("message", onMessage);
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
          {messages.map((message, ix) => (
            <ListItem key={ix} alignItems="flex-start" sx={{ flexDirection: message.role === 'human' ? 'row-reverse' : 'row' }}>
              <Avatar sx={{ bgcolor: message.role === 'ai' ? 'primary.main' : 'secondary.main', mr: message.role === 'human' ? 0 : 2, ml: message.role === 'human' ? 2 : 0 }}>
                {message.role === 'ai' ? <SmartToy /> : <Person />}
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
          ))}
        </List>
        <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', mt: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button type="submit" variant="contained" endIcon={<Send />} sx={{ ml: 1 }}>
            Send
          </Button>
        </Box>


{/*
            <Stack>

                {
                    messages.map(
                       (m, ix) => {
                           return (
                               <Box
                                   className={'message ' + m.role}
                                   key={'msg' + ix.toString()}
                               >
                                   {m.text}
                               </Box>
                           );
                        }
                    )
                }

                <Box sx={{ pt: '3rem' }}>
                    <TextField label="input" variant="outlined"
                      onChange={ (event) => setText(event.target.value) }
                      defaultValue={text}
                    />
                </Box>

                <Box>
                    <Button onClick={()=>click()}>Submit</Button>
                </Box>

            </Stack>
            */}



</CardContent>
</Card>
        </>

    );

}

export default Chat;

