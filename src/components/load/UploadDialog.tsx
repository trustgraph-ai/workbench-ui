import React, { useEffect, useState, useRef } from "react";

import { SendHorizontal } from "lucide-react";
import { Upload, FilePlus } from "lucide-react";

import { useLoadStateStore } from "../../state/load";
import SelectedFiles from "./SelectedFiles";
import { useProgressStateStore } from "../../state/progress";
import { loadFile, loadText } from "../../utils/document-load";
import { toaster } from "../ui/toaster";

import {
  List,
  Portal,
  Button,
  Dialog,
  Box,
  CloseButton,
} from "@chakra-ui/react";

import { useSocket } from "../../api/trustgraph/socket";
import SelectField from "../common/SelectField";
import SelectOption from "../common/SelectOption";
import ChipInputField from "../common/ChipInputField";

import Title from "./Title";
import Comments from "./Comments";
import Url from "./Url";
import Keywords from "./Keywords";
import Operation from "./Operation";
import Content from "./Content";

const SubmitDialog = ({ open, onOpenChange, onComplete }) => {

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

  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  const kind = operation == "upload-pdf" ? "PDF" : "text";

  const [tags, setTags] = useState([]);

  const fl2a = (x: FileList | null): File[] => {
    if (x) return Array.from(x);
    else return [];
  };

  const onFilesSubmit = () => {
    const filesToLoad = [...files];

    // Shouldn't happen, make it a noop
    if (filesToLoad.length == 0) return;

    loadOneFile(filesToLoad)
      .then(() => {
        console.log("Success");
        toaster.create({
          title: "Files uploaded",
          type: "success",
        });
        onComplete(false);
      })
      .catch((e) =>
        toaster.create({
          title: "Error: " + e.toString(),
          type: "error",
        }),
      );
  };

  const loadOneFile = (files) => {
    const kind = operation == "upload-pdf" ? "application/pdf" : "text/plain";

    const act = "Uploading: " + files[0].name;
    addActivity(act);

    // Create a promise for the first file in the list
    const prom = loadFile(files[0], kind, {
      title: title,
      url: url,
      keywords: keywords,
      comments: comments,
      socket: socket,
    })
      .then(() => {
        toaster.create({
          title: files[0].name + " uploaded",
          type: "info",
        });

        // Add file to 'uploaded' list
        addUploaded(files[0].name);
        removeFile(files[0]);

        removeActivity(act);
      })
      .catch((e) => {
        removeActivity(act);
        throw e;
      });

    if (files.length < 2) {
      return prom;
    } else {
      return prom.then(() => loadOneFile(files.slice(1)));
    }
  };

  const onTextSubmit = () => {
    loadText(text, {
      title: title,
      url: url,
      keywords: keywords,
      comments: comments,
      addActivity: addActivity,
      removeActivity: removeActivity,
      onSuccess: () => handleTextSuccess(),
      socket: socket,
    })
      .then(() => {
        setText("");
        incTextUploads();
        toaster.create({
          title: "Text uploaded",
          type: "success",
        });
        onComplete(false);
      })
      .catch((e) =>
        toaster.create({
          title: "Error: " + e.toString(),
          type: "error",
        }),
      );
  };

  const onSubmit = () => {

    if (operation == "upload-pdf") {
      onFilesSubmit();
    } else if (operation == "upload-text") {
      onFilesSubmit();
    } else {
      onTextSubmit();
    }

  };

  return (
    <Dialog.Root
      placement="center"
      open={open}
      size="xl"
      onOpenChange={(x) => {
        onOpenChange(x.open);
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Submit documents for processing</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>


          <Title />
          <Url />
          <Keywords />
          <Comments />


        <Operation />

              <Content />

            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => onSubmit()}
                colorPalette="brand"
              >
                <SendHorizontal /> Submit
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>


          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default SubmitDialog;
