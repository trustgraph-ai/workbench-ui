
import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';

import { Typography, Box, Button, Stack, TextField } from '@mui/material';

import { ArrowForward, CloudUpload } from '@mui/icons-material';

import { useSocket } from '../socket/socket';
import { useWorkbenchStateStore } from '../state/WorkbenchState';
//import { getTriples } from '../state/knowledge-graph';

import Title from './Title';
import Url from './Url';
import Keywords from './Keywords';
import Operation from './Operation';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const Content : React.FC<{operation : string}> = ({ operation }) => {

    if (operation == "upload-pdf") {
        return (
            <Button
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              startIcon={<CloudUpload />}
            >
              Upload PDF files
              <VisuallyHiddenInput
                type="file"
                onChange={(event) => console.log(event.target.files)}
                multiple
              />
            </Button>            
        );
    }

    if (operation == "upload-text") {
        return (
            <Button
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              startIcon={<CloudUpload />}
            >
              Upload text files
              <VisuallyHiddenInput
                type="file"
                onChange={(event) => console.log(event.target.files)}
                multiple
              />
            </Button>            
        );
    }

    if (operation == "upload-text") return null;
    
    return (
        <Box sx={{ m: 2 }}>
            <TextField
                fullWidth
                label="Text"
                multiline
                rows={15}
            />
        </Box>
    );
}

interface LoadProps {
}

const Load : React.FC <LoadProps> = ({
}) => {

    const socket = useSocket();

    const [title, setTitle] = useState<string>("");
    const [url, setUrl] = useState<string>("");
    const [keywords, setKeywords] = useState<string[]>([]);
    const [operation, setOperation] = useState<string>("upload-pdf");

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

            <Operation
                value={operation}
                setValue={setOperation}
            />

            <Content operation={operation}/>

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

