import React, { useEffect, useState } from "react";

import { Trash, SendHorizontal } from "lucide-react";

import {
  Portal,
  Button,
  Dialog,
  CloseButton,
} from "@chakra-ui/react";

import { useSocket } from "../../api/trustgraph/socket";
import { useMcpTools } from "../../state/mcp-tools";
import TextField from "../common/TextField";
import { toaster } from "../ui/toaster";

const EditDialog = ({ open, onOpenChange, onComplete, id, create }) => {
  const socket = useSocket();
  const { updateTool, createTool, deleteTool } = useMcpTools();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");


  useEffect(() => {
    if (!id) return;

    socket
      .config()
      .getConfig([{ type: "mcp", key: id }])
      .then((x) => {
        return JSON.parse(x.values[0].value);
      })
      .then((x) => {
        // Store MCP tool information
        setName(x.name);
        setUrl(x.url);
      })
      .catch((e) => {
        console.log("Error:", e);
        toaster.create({
          title: "Error: " + e.toString(),
          type: "error",
        });
      });
  }, [id, create, socket]);



  const onEdit = () => {
    // Build the MCP tool structure
    const toolStruct = {
      name: name,
      url: url,
    };

    if (create) {
      createTool({ id: name, tool: toolStruct, onSuccess: onComplete });
    } else {
      updateTool({ id, tool: toolStruct, onSuccess: onComplete });
    }
  };


  const onDelete = () => {
    if (create) return;
    deleteTool({ id, onSuccess: onComplete });
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
              {create && <Dialog.Title>Create MCP Tool</Dialog.Title>}

              {!create && (
                <Dialog.Title>
                  Edit MCP Tool: <code>{id}</code>
                </Dialog.Title>
              )}
            </Dialog.Header>
            <Dialog.Body>
              <TextField
                label="Name"
                placeholder="Enter tool name (used as ID)"
                value={name}
                onValueChange={(v) => setName(v)}
                required={true}
              />

              <TextField
                label="MCP Endpoint URL"
                placeholder="Enter MCP endpoint URL"
                value={url}
                onValueChange={(v) => setUrl(v)}
                required={true}
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {
                // If a 'create' operation, there's nothing to delete, only
                // present if an existing tool exists
              }
              {!create && (
                <Button
                  variant="solid"
                  onClick={() => onDelete()}
                  colorPalette="red"
                >
                  <Trash /> Delete
                </Button>
              )}
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
