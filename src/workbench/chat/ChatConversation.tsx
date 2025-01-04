
import React from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import ChatHistory from './ChatHistory';
import InputArea from './InputArea';

import { useSocket } from '../socket/socket';
import { Entity } from '../state/Entity';
import { Triple, Value } from '../state/Triple';
import { useWorkbenchStateStore } from '../state/WorkbenchState';
import { useProgressStateStore } from '../state/ProgressState';
import { useChatStateStore } from '../state/ChatState';
import { RDFS_LABEL } from '../state/knowledge-graph';

interface ChatConversationProps {
};

const ChatConversation : React.FC <ChatConversationProps> = ({
}) => {

    const socket = useSocket();

    const addMessage = useChatStateStore((state) => state.addMessage);

    const input = useChatStateStore((state) => state.input);
    const setInput = useChatStateStore((state) => state.setInput);

    const addActivity = useProgressStateStore(
        (state) => state.addActivity
    );
    const removeActivity = useProgressStateStore(
        (state) => state.removeActivity
    );

    const setEntities = useWorkbenchStateStore((state) => state.setEntities);
      
    const onSubmit = () => {

        addMessage("human", input);

        const ragActivity = "Graph RAG: " + input;
        const embActivity = "Find entities: " + input;

        addActivity(ragActivity);
        addActivity(embActivity);

/*
        socket.agent(
            input,
            (m) => addMessage("ai", "\u{1f914} " + m),
            (m) => addMessage("ai", "\u{1f575}\u{fe0f} " + m),
            (m) => addMessage("ai", m)
        );
*/

/*
        socket.textCompletion("You are a helpful agent", input).then(
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
                removeActivity(ragActivity);
            }
        ).catch(
            (err) => {
                console.log("Graph RAG error:", err);

                addMessage("ai", err.toString());
                setInput("");
                removeActivity(ragActivity);
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
                        (ent : Value) => {
                            const act = "Label " + ent.v;
                            addActivity(act);
                            return socket.triplesQuery(
                                ent,
                                { v: RDFS_LABEL, e: true, },
                                undefined,
                                1
                            ).then(
                                (x) => {
                                    removeActivity(act);
                                    return x;
                                }
                            ).catch(
                                (err) => {
                                    removeActivity(act);
                                    throw err;
                                }
                            )
                        }
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

                removeActivity(embActivity);

            }

        ).catch(
            (err) => {
                console.log("Graph embeddings error:", err);

                addMessage("ai", err.toString());
                removeActivity(embActivity);
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

