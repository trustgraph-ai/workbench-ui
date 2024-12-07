
import React, { useState, useEffect, useCallback } from 'react';

import { Box, Button, Stack, TextField } from '@mui/material';

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
        }
    ]);

    const onMessage = useCallback((message : any) => {
        console.log("MESSAGE:", message);
        if (message.data) {
            console.log(message.data);
            const obj = JSON.parse(message.data);
            console.log(obj.response.response);
        }
    }, []);

//console.log(messages);

    const click = () => {
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

            <Stack sx={{ width: "40rem" }}>

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

        </>

    );

}

export default Chat;

