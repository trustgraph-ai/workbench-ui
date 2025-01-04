
import React, { useState } from 'react';

import Button from '@mui/material/Button';

import { useProgressStateStore } from '../state/ProgressState';
import { useSocket } from '../socket/socket';
import { useWorkbenchStateStore } from '../state/WorkbenchState';
import { useSearchStateStore } from '../state/SearchState';
import {
    getGraphEmbeddings, addRowLabels, addRowDefinitions,
    addRowEmbeddings, computeCosineSimilarity, sortSimilarity,
} from '../state/row';
import Results from './Results';
import SearchInput from './SearchInput';

interface SearchProps {
}

const Search : React.FC <SearchProps> = ({
}) => {

    const addActivity = useProgressStateStore(
        (state) => state.addActivity
    );

    const removeActivity = useProgressStateStore(
        (state) => state.removeActivity
    );

    const error = useProgressStateStore((state) => state.error);
    const setError = useProgressStateStore((state) => state.setError);

    const socket = useSocket();

    const setEntities = useWorkbenchStateStore((state) => state.setEntities);

    const view = useSearchStateStore((state) => state.rows);
    const setView = useSearchStateStore((state) => state.setRows);

    const search = useSearchStateStore((state) => state.input);

    const submit : React.FormEventHandler<HTMLFormElement> = (e) => {

        const searchAct = "Search: " + search;
        addActivity(searchAct);

        socket.embeddings(search).then(
            getGraphEmbeddings(socket, addActivity, removeActivity, 10)
        ).then(
            addRowLabels(socket, addActivity, removeActivity)
        ).then(
            addRowDefinitions(socket, addActivity, removeActivity)
        ).then(
            addRowEmbeddings(socket, addActivity, removeActivity)
        ).then(
            computeCosineSimilarity(addActivity, removeActivity)
        ).then(
            sortSimilarity(addActivity, removeActivity)
        ).then(
            (x) => {

                setView(x);

                setEntities(x.map(
                    (row) => {
                        return {
                            uri: row.uri,
                            label: row.label ? row.label : "n/a",
                        };
                    }
                ));

                removeActivity(searchAct);

                setError("");

            }
        ).catch(
            (err) => {
                console.log("Error: ", err);
                setError(err.toString());
                removeActivity(searchAct);
            }
        );

        e.preventDefault();
    
    }

    return (
        <>

            <SearchInput submit={submit}/>

            {
                view.length > 0 &&
                <Results/>
            }

        </>

    );

}

export default Search;

