
import {v4 as uuidv4} from 'uuid';

import React, { useState, useEffect } from 'react';

import { Typography, Box, Button, TextField } from '@mui/material';

import { useSocket } from '../socket/socket';
import { Triple } from '../state/Triple';

import Title from './Title';
import Url from './Url';
import Keywords from './Keywords';
import Operation from './Operation';
import TextBuffer from './TextBuffer';
import FileUpload from './FileUpload';

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";
const DIGITAL_DOCUMENT = "https://schema.org/DigitalDocument";
const SCHEMA_URL = "https://schema.org/url";
const SCHEMA_KEYWORDS = "https://schema.org/keywords";

const Content : React.FC<{
    operation : string,
    files : File[],
    setFiles : (f : string[]) => void;
    uploaded : File[],
    setUploaded : (f : string[]) => void;
    submit : () => void;
    text : string,
    setText : (s : string) => void;
}> = ({
    operation, files, setFiles, submit, text, setText,
    uploaded, setUploaded,
}) => {

    if (operation == "upload-pdf") {
        return (
            <FileUpload
                files={files} setFiles={setFiles}
                uploaded={uploaded} setUploaded={setUploaded}
                submit={submit}
                kind="PDF"
            />
        );
    }

    if (operation == "upload-text") {
        return (
            <FileUpload
                files={files} setFiles={setFiles}
                uploaded={uploaded} setUploaded={setUploaded}
                submit={submit}
                kind="text"
            />
        );
    }

    return (
        <TextBuffer
            value={text}
            setValue={setText}
            submit={submit}
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
    const [uploaded, setUploaded] = useState<string[]>([]);
    const [text, setText] = useState<string>("");

//    useEffect(() => {

        const submit = () => {

            let reader = new FileReader();

            reader.onloadend = function() {

                const doc_id = uuidv4();

                const base64String = reader.result
                    .replace('data:', '')
                    .replace(/^.+,/, '');

                console.log(doc_id);
                console.log(base64String);

                let doc_meta : Triple[] = [
                    {
                        s: { v: doc_id, e: true },
                        p: { v: RDF_TYPE, e: true },
                        o: { v: DIGITAL_DOCUMENT, e: true },
                    }
                ];

                if (title != "")
                    doc_meta.push(
                        {
                            s: { v: doc_id, e: true },
                            p: { v: RDFS_LABEL, e: true },
                            o: { v: title, e: false },
                        }
                    );

                if (url != "")
                    doc_meta.push(
                        {
                            s: { v: doc_id, e: true },
                            p: { v: SCHEMA_URL, e: true },
                            o: { v: url, e: true },
                        }
                    );

                for (let keyword of keywords)
                    doc_meta.push(
                        {
                            s: { v: doc_id, e: true },
                            p: { v: SCHEMA_KEYWORDS, e: true },
                            o: { v: keyword, e: false },
                        }
                    );

                console.log(doc_meta);

            }

            reader.readAsDataURL(files[0]);

            console.log("SUBMIT");

/*
            setUploaded([
                ...uploaded,
                ...Array.from(files).map((f) => f.name)
            ]);
            setFiles([]);
*/
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
                files={files} setFiles={setFiles}
                uploaded={uploaded} setUploaded={setUploaded}
                submit={submit}
            />

        </>

    );

}

export default Load;

