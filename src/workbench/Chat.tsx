
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
        if (message.data) {
            console.log(message.data);
            const obj = JSON.parse(message.data);
            console.log(obj.response.response);
        }
    }, []);

    const click = () => {
        console.log(text);
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

