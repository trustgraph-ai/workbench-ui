import {
  getGraphEmbeddings,
  addRowLabels,
  addRowDefinitions,
  addRowEmbeddings,
  computeCosineSimilarity,
  sortSimilarity,
} from "../state/row";

export const vectorSearch =
    (socket, addActivity, removeActivity, term : string) => {

    const searchAct = "Search: " + term;
    addActivity(searchAct);

return socket
    .embeddings(term)
    .then(getGraphEmbeddings(socket, addActivity, removeActivity, 10))
    .then(addRowLabels(socket, addActivity, removeActivity))
    .then(addRowDefinitions(socket, addActivity, removeActivity))
    .then(addRowEmbeddings(socket, addActivity, removeActivity))
    .then(computeCosineSimilarity(addActivity, removeActivity))
    .then(sortSimilarity(addActivity, removeActivity))
    .then((x) => {

        removeActivity(searchAct);
        return {

            view: x,
            entities: x.map((row) => {
          return {
            uri: row.uri,
            label: row.label ? row.label : "n/a",
          };
        }),
        };

    }

         ).catch(
             (err) => {
        removeActivity(searchAct);
                 throw err;
             }
         );

};



    
