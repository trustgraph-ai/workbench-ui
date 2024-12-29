
import React, { useState, useEffect } from 'react';

import { Typography, Box, Button, TextField } from '@mui/material';


import { useSocket } from '../socket/socket';

import Title from './Title';
import Url from './Url';
import Keywords from './Keywords';
import Operation from './Operation';
import TextBuffer from './TextBuffer';
import FileUpload from './FileUpload';

const Content : React.FC<{
    operation : string,
    files : File[],
    setFiles : (f : File[]) => void;
    submit : () => void;
    text : string,
    setText : (s : string) => void;
}> = ({
    operation, files, setFiles, submit, text, setText,
}) => {

    if (operation == "upload-pdf") {
        return (
            <FileUpload
                files={files} setFiles={setFiles}
                submit={submit}
            />
        );
    }

    if (operation == "upload-text") {
        return (
            <FileUpload
                files={files} setFiles={setFiles}
                submit={submit}
            />
        );
    }

    return (
        <TextBuffer
            value={text}
            setValue={setText}
        />
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
    const [files, setFiles] = useState<File[]>([]);
    const [text, setText] = useState<string>("");

//    useEffect(() => {

        const submit = () => {

            let reader = new FileReader();

            reader.onloadend = function() {

                const base64String = reader.result
                    .replace('data:', '')
                    .replace(/^.+,/, '');

                console.log(base64String);

            }

            reader.readAsDataURL(files[0]);

            console.log("SUBMIT");

        }

//    }, []);

    useEffect(() => {

    }, []);

    return (
        <>
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

            <Content
                operation={operation}
                text={text} setText={setText}
                files={files}
                setFiles={setFiles}
                submit={submit}
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

