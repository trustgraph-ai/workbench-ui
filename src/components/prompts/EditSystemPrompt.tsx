import React, { useEffect, useState } from "react";

import { SendHorizontal } from "lucide-react";

import { Portal, Button, Dialog, CloseButton } from "@chakra-ui/react";

import { useSocket } from "../../api/trustgraph/socket";
import TextAreaField from "../common/TextAreaField";
import { toaster } from "../ui/toaster";

const EditDialog = ({ open, onOpenChange, onComplete }) => {
  const socket = useSocket();

  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    socket
      .getConfig([{ type: "prompt", key: "system" }])
      .then((x) => {
        return JSON.parse(x.values[0].value);
      })
      .then((x) => {
        // Store flow information
        setPrompt(x);
      })
      .catch((e) => {
        console.log("Error:", e);
        toaster.create({
          title: "Error: " + e.toString(),
          type: "error",
        });
      });
  }, [socket]);

  const onEdit = () => {
    // Build the prompt structure

    return socket
      .putConfig([
        {
          type: "prompt",
          key: "system",
          value: JSON.stringify(prompt),
        },
      ])
      .then(() => {
        toaster.create({
          title: "Edited prompt",
          type: "success",
        });
        onComplete();
      })
      .catch((e) => {
        console.log("Error:", e);
        toaster.create({
          title: "Error: " + e.toString(),
          type: "error",
        });
      });
  };

  return (
    <Dialog.Root
      placement="center"
      size="xl"
      open={open}
      onOpenChange={(x) => {
        onOpenChange(x.open);
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Edit system prompt</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <TextAreaField
                label="System prompt"
                placeholder="Enter AI prompt"
                value={prompt}
                onValueChange={(v) => setPrompt(v)}
                required={true}
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => onEdit()} colorPalette="brand">
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

export default EditDialog;
