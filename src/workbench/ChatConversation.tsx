
import React from 'react';

import { Card, CardContent, Typography } from '@mui/material';

import ChatHistory from './ChatHistory';
import InputArea from './InputArea';

import { useSocket } from './socket/socket';
import { Entity } from './state/Entity';
import { Triple, Value } from './state/Triple';
import { useWorkbenchStateStore } from './state/WorkbenchState';

interface ChatConversationProps {
};

const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label"

const ChatConversation : React.FC <ChatConversationProps> = ({
}) => {

    const socket = useSocket();

    const addMessage = useWorkbenchStateStore((state) => state.addMessage);

    const input = useWorkbenchStateStore((state) => state.input);
    const setInput = useWorkbenchStateStore((state) => state.setInput);

    const incWorking = useWorkbenchStateStore((state) => state.incWorking);
    const decWorking = useWorkbenchStateStore((state) => state.decWorking);

    const setEntities = useWorkbenchStateStore((state) => state.setEntities);
      
    const onSubmit = () => {

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

/*
        socket.textCompletion(system, input).then(
            (text : string) => {
                addMessage("ai", text);
                setInput("");
                decWorking();
            }
        );
        */

        socket.graphRag(
            input
        ).then(
            (text : string) => {
                addMessage("ai", text);
                setInput("");
                decWorking();
            }
        ).catch(
            (err) => {
                console.log("Graph RAG error:", err);

                addMessage("ai", err.toString());
                setInput("");
                decWorking();

            }
        );

        // Take the text, and get embeddings
        socket.embeddings(input).then(

            // Take the embeddings, and lookup entities using graph
            // embeddings
            (vecs : number[][]) => {
                return socket.graphEmbeddingsQuery(vecs, 15);
            }

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

                setEntities(entities);

                decWorking();

            }

        ).catch(
            (err) => {
                console.log("Graph embeddings error:", err);

                addMessage("ai", err.toString());
                decWorking();
            }
        );

    };

    return (
        <>
            <Card
                className="chat-conversation"
                sx={{
                    margin: "0.5rem", height: "100%",
                    minWidth: '30rem', maxWidth: '60rem',
                    overflowY: 'auto'
                }}
            >

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

