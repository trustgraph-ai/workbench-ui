
import React from 'react';

import TextBuffer from './TextBuffer';
import FileUpload from './FileUpload';

const Content : React.FC<{
    operation : string,
    files : File[],
    setFiles : (f : string[]) => void;
    uploaded : File[],
    setUploaded : (f : string[]) => void;
    submitFiles : () => void;
    submitText : () => void;
    text : string,
    setText : (s : string) => void;
}> = ({
    operation,
    files, setFiles,
    text, setText,
    uploaded, setUploaded,
    submitFiles,
    submitText,
}) => {

    if (operation == "upload-pdf") {
        return (
            <FileUpload
                files={files} setFiles={setFiles}
                uploaded={uploaded} setUploaded={setUploaded}
                submit={submitFiles}
                kind="PDF"
            />
        );
    }

    if (operation == "upload-text") {
        return (
            <FileUpload
                files={files} setFiles={setFiles}
                uploaded={uploaded} setUploaded={setUploaded}
                submit={submitFiles}
                kind="text"
            />
        );
    }

    return (
        <TextBuffer
            value={text}
            setValue={setText}
            submit={submitText}
        />
    );

}

export default Content;



