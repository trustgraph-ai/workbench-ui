
import React from 'react';
import { FileUp } from 'lucide-react';

import {v4 as uuidv4} from 'uuid';

import { useSocket } from '../api/trustgraph/socket';
import { Triple } from '../api/trustgraph/Triple';

import Title from '../components/load/Title';
import Comments from '../components/load/Comments';
import Url from '../components/load/Url';
import Keywords from '../components/load/Keywords';
import Operation from '../components/load/Operation';
import Content from '../components/load/Content';
import { useProgressStateStore } from '../state/ProgressState';
import CenterSpinner from '../components/common/CenterSpinner';
import { useLoadStateStore } from '../state/LoadState';
import PageHeader from '../components/common/PageHeader';

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";
const DIGITAL_DOCUMENT = "https://schema.org/DigitalDocument";
const SCHEMA_URL = "https://schema.org/url";
const SCHEMA_KEYWORDS = "https://schema.org/keywords";

const Load = () => {

    const setError = useProgressStateStore((state) => state.setError);

    const addActivity = useProgressStateStore(
        (state) => state.addActivity
    );
    const removeActivity = useProgressStateStore(
        (state) => state.removeActivity
    );

    const socket = useSocket();

    const title = useLoadStateStore((state) => state.title);
    const comments = useLoadStateStore((state) => state.comments);
    const url = useLoadStateStore((state) => state.url);
    const keywords = useLoadStateStore((state) => state.keywords);
    const operation = useLoadStateStore((state) => state.operation);
    const files = useLoadStateStore((state) => state.files);
    const text = useLoadStateStore((state) => state.text);
    const setText = useLoadStateStore((state) => state.setText);
    const addUploaded = useLoadStateStore((state) => state.addUploaded);
    const removeFile = useLoadStateStore((state) => state.removeFile);
    const incTextUploads = useLoadStateStore((state) => state.incTextUploads);

    const prepareMetadata = (doc_id : string) => {

        let doc_meta : Triple[] = [
            {
                s: { v: doc_id, e: true },
                p: { v: RDF_TYPE, e: true },
                o: { v: DIGITAL_DOCUMENT, e: true },
            }
        ];

        if (title != "")
            doc_meta = [
                ...doc_meta,
                {
                    s: { v: doc_id, e: true },
                    p: { v: RDFS_LABEL, e: true },
                    o: { v: title, e: false },
                }
            ];

        if (url != "")
            doc_meta = [
                ...doc_meta,
                {
                    s: { v: doc_id, e: true },
                    p: { v: SCHEMA_URL, e: true },
                    o: { v: url, e: true },
                }
            ];

        for (const keyword of keywords)
            doc_meta = [
                ...doc_meta,
                {
                    s: { v: doc_id, e: true },
                    p: { v: SCHEMA_KEYWORDS, e: true },
                    o: { v: keyword, e: false },
                }
            ];

        return doc_meta;

    }

    const handleFileSuccess = (file : File) => {

        // Add file to 'uploaded' list
        addUploaded(file.name);

        // Remove file from 'selected' list
        removeFile(file);

    }

    const create_doc_id = () => {
        return "https://trustgraph.ai/doc/" + uuidv4();
    }

    const submitFiles = () => {

        const doc_id = create_doc_id();
        const doc_meta = prepareMetadata(doc_id);

        for (const file of files) {

            console.log(file.name, "...");

            const reader = new FileReader();

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

                    socket.loadLibraryDocument(
                        data, doc_id, doc_meta, "application/pdf",
                        title, comments, keywords, null,
                    ).then(
                        () => {
                            handleFileSuccess(file);
                            removeActivity(act);
                        }
                    ).catch(
                        (e) => {
                            removeActivity(act);
                            setError(e.toString());
                            console.log("Error:", e);
                        }
                    );

                } else {

                    // Must be upload-text

                    socket.loadLibraryDocument(
                        data, doc_id, doc_meta, "text/plain",
                        title, comments, keywords, null,
                    ).then(
                        () => {
                            handleFileSuccess(file);
                            removeActivity(act);
                        }
                    ).catch(
                        (e) => {
                            removeActivity(act);
                            setError(e.toString());
                            console.log("Error:", e);
                        }
                    );

                }

            }

            reader.readAsDataURL(file);

        }

    }

    const b64encode = (input) => {
        return btoa(encodeURIComponent(input).replace(
            /%([0-9A-F]{2})/g,
            (_match, p1) => {
                return String.fromCharCode(("0x" + p1));
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
            () => {
                removeActivity(act);
                setText("");
                incTextUploads();
            }
        ).catch(
            (e) => {
                removeActivity(act);
                setError(e.toString());
                console.log("Error:", e);
            }
        );

    }

    return (
        <>
            <PageHeader
              icon={ <FileUp /> }
              title="Document load"
              description="Load documents into TrustGraph processing"
            />
            <Title/>
            <Comments/>
            <Url/>
            <Keywords/>
            <Operation/>
            <Content
                submitFiles={submitFiles}
                submitText={submitText}
            />
            <CenterSpinner/>
        </>

    );

}

export default Load;

