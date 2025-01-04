
import React from 'react';

import TextBuffer from './TextBuffer';
import FileUpload from './FileUpload';
import { useLoadStateStore } from '../state/LoadState';

const Content : React.FC<{
    submitFiles : () => void;
    submitText : () => void;
}> = ({
    submitFiles,
    submitText,
}) => {

    const operation = useLoadStateStore((state) => state.operation);

    if (operation == "upload-pdf") {
        return (
            <FileUpload
                submit={submitFiles}
                kind="PDF"
            />
        );
    }

    if (operation == "upload-text") {
        return (
            <FileUpload
                submit={submitFiles}
                kind="text"
            />
        );
    }

    return (
        <TextBuffer
            submit={submitText}
        />
    );

}

export default Content;



