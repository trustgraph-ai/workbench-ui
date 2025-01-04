
import { RDFS_LABEL } from '../state/knowledge-graph';
import { Socket } from '../socket/trustgraph-socket';
import { Entity } from '../state/Entity';
import { Triple, Value } from '../state/Triple';
      
export const submitChat = (
    socket : Socket,
    input : string,
    addMessage : (role : string, m : string) => void,
    addActivity : (act : string) => void,
    removeActivity : (act : string) => void,
    setInput : (v : string) => void,
    setEntities : (v : Entity[]) => void,
) => {

    addMessage("human", input);

    const ragActivity = "Graph RAG: " + input;
    const embActivity = "Find entities: " + input;


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

    addActivity(ragActivity);
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
    addActivity(embActivity);
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
            removeActivity(embActivity);
            addMessage("ai", err.toString());
        }
    );

};

