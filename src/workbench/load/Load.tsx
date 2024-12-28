
import React, { useState, useEffect } from 'react';

import { Typography, Box, Stack, Button, TextField } from '@mui/material';

import { ArrowForward } from '@mui/icons-material';

import { useSocket } from '../socket/socket';
import { useWorkbenchStateStore } from '../state/WorkbenchState';
//import { getTriples } from '../state/knowledge-graph';

import Title from './Title';
import Url from './Url';
import Keywords from './Keywords';

interface LoadProps {
}

const Load : React.FC <LoadProps> = ({
}) => {

    const socket = useSocket();

    const [title, setTitle] = useState<string>("");
    const [url, setUrl] = useState<string>("");
    const [keywords, setKeywords] = useState<string[]>([]);

    useEffect(() => {

    }, []);

    return (
        <>
            <Typography variant="h5" component="div" gutterBottom>
                Load
            </Typography>

            <Title
                value={title}
                setValue={setTitle}
            />

            <Url
                value={url}
                setValue={setUrl}
            />

            <Keywords
                value={keywords}
                setValue={setKeywords}
            />

{/*
            <Box>

                <TextField
                    sx={{
                        width: '30rem'
                    }}
                    id="publication"
                    label="Publication event"
                />

            </Box>

            <Box>

                <TextField
                    sx={{
                        width: '30rem'
                    }}
                    id="org"
                    label="Publishing organization"
                />

            </Box>
*/}

        </>

    );

}

export default Load;

