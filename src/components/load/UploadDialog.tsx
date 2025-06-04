import { SendHorizontal } from "lucide-react";

import { useLoadStateStore } from "../../state/load";

import { useLibrary } from "../../state/library.ts";

import { Portal, Button, Dialog, CloseButton } from "@chakra-ui/react";

import { DocumentParameters } from "../../model/document-metadata";

import Title from "./Title";
import Comments from "./Comments";
import Url from "./Url";
import Keywords from "./Keywords";
import Operation from "./Operation";
import Content from "./Content";

const SubmitDialog = ({ open, onOpenChange }) => {
  // Hook for accessing library state and operations
  const library = useLibrary();

  // Input fields
  const title = useLoadStateStore((state) => state.title);
  const comments = useLoadStateStore((state) => state.comments);
  const url = useLoadStateStore((state) => state.url);
  const keywords = useLoadStateStore((state) => state.keywords);
  const operation = useLoadStateStore((state) => state.operation);
  const files = useLoadStateStore((state) => state.files);
  const setFiles = useLoadStateStore((state) => state.setFiles);
  const text = useLoadStateStore((state) => state.text);

  const onSubmit = () => {
    if (operation == "upload-pdf") {
      onFilesSubmit();
    } else if (operation == "upload-text") {
      onFilesSubmit();
    } else {
      onTextSubmit();
    }
  };

  const onFilesSubmit = () => {
    // Shouldn't happen
    if (files.length < 1) throw "Was expecting some files";

    // FIXME: Should be in auth
    const user = "trustgraph";

    const params: DocumentParameters = {
      title: title,
      url: url,
      keywords: keywords,
      comments: comments,
    };

    library.uploadFiles({
      files: files,
      params: params,
      mimeType: operation == "upload-pdf" ? "application/pdf" : "text/plain",
      user: user,
      onSuccess: () => {
        setFiles([]);
        onOpenChange(false);
      },
    });
  };

  const onTextSubmit = () => {
    // FIXME: Should be in auth
    const user = "trustgraph";

    const params: DocumentParameters = {
      title: title,
      url: url,
      keywords: keywords,
      comments: comments,
    };

    library.uploadText({
      text: text,
      params: params,
      mimeType: "text/plain",
      user: user,
      onSuccess: () => {
        setFiles([]);
        onOpenChange(false);
      },
    });
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
              <Button onClick={() => onSubmit()} colorPalette="brand">
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
