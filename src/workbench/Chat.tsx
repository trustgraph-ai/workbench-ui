
import React, { useState, useEffect, useCallback } from 'react';

import { Button, TextField } from '@mui/material';

import { useSocket } from './socket/Socket';

interface ChatProps {
}

const Chat : React.FC <ChatProps> = ({
}) => {

    const socket = useSocket();

    const [text, setText] = useState<string>("hello world");

    const onMessage = useCallback((message : any) => {
        console.log("MESSAGE:", message);
    }, []);

    const click = () => {
        console.log(text);
        console.log(socket);
        socket.send(
            JSON.stringify({
                "id": "12314",
                "service": "embeddings",
                "request": {
                    "text": text
                }
            })
        );

    }

    useEffect(() => {
        socket.addEventListener("message", onMessage);

        return () => {
            socket.removeEventListener("message", onMessage);
        }

    });

    return (

        <>

            <TextField label="input" variant="outlined"
              onChange={ (event) => setText(event.target.value) }
              defaultValue={text}
            />

            <Button onClick={()=>click()}>Hello</Button>
        </>

    );

}

export default Chat;

