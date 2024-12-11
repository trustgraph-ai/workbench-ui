
import React, { useState, Dispatch, SetStateAction } from 'react';

import { Card, CardContent, Typography } from '@mui/material';

import ChatHistory from './ChatHistory';
import InputArea from './InputArea';

import { useSocket } from './socket/socket';
import { Message } from './state/Message';
import { Entity } from './state/Entity';
import { Triple, Value } from './socket/trustgraph-socket';
import { useWorkbenchStateStore } from './state/WorkbenchState';

interface ChatConversationProps {
    setEntities : Dispatch<SetStateAction<Entity[]>>;
};

const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label"

const ChatConversation : React.FC <ChatConversationProps> = ({
    setEntities
}) => {

    const socket = useSocket();

    const messages = useWorkbenchStateStore((state) => state.messages);
    const addMessage = useWorkbenchStateStore((state) => state.addMessage);

    const input = useWorkbenchStateStore((state) => state.input);
    const setInput = useWorkbenchStateStore((state) => state.setInput);

    const incWorking = useWorkbenchStateStore((state) => state.incWorking);
    const decWorking = useWorkbenchStateStore((state) => state.decWorking);
      
    const onSubmit = () => {

        let stopSpinner1 = null;
        let stopSpinner2 = null;

        new Promise<boolean>((resolve, reject) => {
            stopSpinner1 = resolve;
        });

        new Promise<boolean>((resolve, reject) => {
            stopSpinner2 = resolve;
        });

        console.log("-> ", input);

        addMessage("human", input);

        incWorking();
        incWorking();

/*
        socket.agent(
            input,
            (m) => addMessage("ai", "\u{1f914} " + m),
            (m) => addMessage("ai, "\u{1f575}\u{fe0f} " + m),
            (m) => addMessage("ai", m)
        );
*/

        socket.textCompletion(input).then(
            (text : string) => {
                addMessage("ai", text);
                setInput("");
                decWorking();
            }
        );

        // Take the text, and get embeddings
        socket.embeddings(input).then(

            // Take the embeddings, and lookup entities using graph
            // embeddings
            (vecs : number[][]) => socket.graphEmbeddingsQuery(vecs, 5)

        ).then(

            // For entities, lookup labels
            (entities : Value[]) => {
                return Promise.all<Triple[]>(
                    entities.map(
                        (ent : Value) =>
                            socket.triplesQuery(
                                ent,
                                { v: RDFS_LABEL, e: true, },
                                undefined,
                                1
                            )
                    )
                );
            }

        ).then(

            // Convert graph labels to an entity list
            (responses : Triple[][]) => {

                let entities : Entity[] = [];

                for(let resp of responses) {

                    if (!resp) continue;
                    if (resp.length < 1) continue;

                    const ent : Entity = {
                        label: resp[0].o.v,
                        uri: resp[0].s.v,
                    };

                    entities.push(ent);

                }

                console.log(entities);
                setEntities(entities);

                decWorking();

            }

        );

    };

    return (
        <>
            <Card sx={{ width: "40rem", margin: "0.5rem" }}>
                <CardContent>
                    <Typography variant="h5" component="div" gutterBottom>
                        AI Chat History
                    </Typography>
                    <ChatHistory/>
                    <InputArea
                        onSubmit={onSubmit}
                    />
                </CardContent>
            </Card>
        </>

    );

}

export default ChatConversation;

