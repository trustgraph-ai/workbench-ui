
import {v4 as uuidv4} from 'uuid';

import React, { useState } from 'react';

import { useSocket } from '../socket/socket';
import { Triple } from '../state/Triple';

import Title from './Title';
import Url from './Url';
import Keywords from './Keywords';
import Operation from './Operation';
import Content from './Content';
import { useProgressStateStore } from '../state/ProgressState';
import CenterSpinner from '../CenterSpinner';

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";
const DIGITAL_DOCUMENT = "https://schema.org/DigitalDocument";
const SCHEMA_URL = "https://schema.org/url";
const SCHEMA_KEYWORDS = "https://schema.org/keywords";

interface LoadProps {
}

const Load : React.FC <LoadProps> = ({
}) => {

    const addActivity = useProgressStateStore(
        (state) => state.addActivity
    );
    const removeActivity = useProgressStateStore(
        (state) => state.removeActivity
    );

    const socket = useSocket();

    const [title, setTitle] = useState<string>("");
    const [url, setUrl] = useState<string>("");
    const [keywords, setKeywords] = useState<string[]>([]);
    const [operation, setOperation] = useState<string>("upload-pdf");
    const [files, setFiles] = useState<File[]>([]);
    const [uploaded, setUploaded] = useState<string[]>([]);
    const [text, setText] = useState<string>("");

    const prepareMetadata = (doc_id : string) => {

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

        return doc_meta;

    }

    const handleFileSuccess = (file : File) => {

        // Add file to 'uploaded' list
        setUploaded(
            (state) => [
                ...state,
                file.name
            ]
        );

        // Remove file from 'selected' list
        setFiles(
            (state) => 
                Array.from(state).filter((f) => f != file)
        );

    }

    const create_doc_id = () => {
        return "https://trustgraph.ai/doc/" + uuidv4();
    }

    const submitFiles = () => {

        const doc_id = create_doc_id();
        const doc_meta = prepareMetadata(doc_id);

        for (const file of files) {

            console.log(file.name, "...");

            let reader = new FileReader();
            reader.onloadend = function() {

                // FIXME: Type is 'string | ArrayBuffer'?  is this safe?

                const data = (reader.result as string)
                    .replace('data:', '')
                    .replace(/^.+,/, '');

                let act;
                if (title != "")
                    act = "Upload document: " + title;
                else
                    act = "Upload document";

                addActivity(act);

                if (operation == "upload-pdf") {

                    socket.loadDocument(
                        data, doc_id, doc_meta
                    ).then(
                        (_x) => {
                            handleFileSuccess(file);
                            removeActivity(act);
                        }
                    ).catch(
                        (e) => {
                            removeActivity(act);
                            console.log("Error:", e);
                        }
                    );

                } else {

                    // Must be upload-text

                    socket.loadText(
                        data, doc_id, doc_meta
                    ).then(
                        (_x) => {
                            handleFileSuccess(file);
                            removeActivity(act);
                        }
                    ).catch(
                        (e) => {
                            removeActivity(act);
                            console.log("Error:", e);
                        }
                    );

                }

            }

            reader.readAsDataURL(file);

        }

    }

    const b64encode = (input : any) => {
        return btoa(encodeURIComponent(input).replace(
            /%([0-9A-F]{2})/g,
            (_match, p1) => {
                return String.fromCharCode(("0x" + p1) as any);
            }
        ));
    }

    const submitText = () => {

        const doc_id = create_doc_id();
        const doc_meta = prepareMetadata(doc_id);

        const encoded = b64encode(text);

        let act;
        if (title != "")
            act = "Upload text: " + title;
        else
            act = "Upload text";

        addActivity(act);

        // Must be upload-text
        socket.loadText(
            encoded, doc_id, doc_meta
        ).then(
            (_x) => {
                removeActivity(act);
                setText("");
            }
        ).catch(
            (e) => {
                removeActivity(act);
                console.log("Error:", e);
            }
        );

    }

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
                uploaded={uploaded}
                submitFiles={submitFiles}
                submitText={submitText}
            />

            <CenterSpinner/>

        </>

    );

}

export default Load;

