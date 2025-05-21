
import React from 'react';
import { FileUp } from 'lucide-react';

import { useSocket } from '../api/trustgraph/socket';

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
import {
  loadFile, loadText,
} from '../utils/document-load';

const Load = () => {

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

    const handleFileSuccess = (file : File) => {

        // Add file to 'uploaded' list
        addUploaded(file.name);

        // Remove file from 'selected' list
        removeFile(file);

    }

    const handleTextSuccess = () => {
      setText("");
      incTextUploads();
    }

    const onFilesSubmit = () => {

        const kind =
          (operation == "upload-pdf") ?
          "application/pdf" :
          "text/plain";

        for (const file of files) {
          loadFile(
            file, kind,
            {
              title: title, url: url, keywords: keywords, comments: comments,
              addActivity: addActivity, removeActivity: removeActivity,
              onSuccess: () => handleFileSuccess(file),
              socket: socket,
            }
          );
        }

    }

    const onTextSubmit = () => {
      console.log("LOADING TEXT");
      loadText(
        text,
        {
          title: title, url: url, keywords: keywords, comments: comments,
          addActivity: addActivity, removeActivity: removeActivity,
          onSuccess: () => handleTextSuccess(),
          socket: socket,
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
                submitFiles={ () => onFilesSubmit() }
                submitText={ () => onTextSubmit() }
            />
            <CenterSpinner/>
        </>

    );

}

export default Load;

