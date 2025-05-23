import React, { useEffect, useState, useRef } from "react";

import { Trash, SendHorizontal } from "lucide-react";

import {
  Portal, Button, Dialog, Box, CloseButton, Popover, Input, Table,
  Editable
} from "@chakra-ui/react";

import { useSocket } from "../../api/trustgraph/socket";
import SelectField from "../common/SelectField";
import TextAreaField from "../common/TextAreaField";
import TextField from "../common/TextField";
import { toaster } from "../ui/toaster";

const EditDialog = ({ open, onOpenChange, onComplete, id, create }) => {
  const socket = useSocket();

  const [newId, setNewId] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [args, setArgs] = useState([]);
  const [argEdit, setArgEdit] = useState("");

  useEffect(() => {

    if (!id) return;

    socket
      .getConfig([{ type: "agent", key: "tool." + id }])
      .then((x) => {
        return JSON.parse(x.values[0].value);
      })
      .then((x) => {
        // Store flow information
        setDescription(x.description);
        setType(x.type);
        setArgs(x.arguments);
      })
      .catch((e) => {
        console.log("Error:", e);
        toaster.create({
          title: "Error: " + e.toString(),
          type: "error",
        });
      });
  }, [id, create, socket]);

  const typeOptions = [
    {
      value: "text-completion",
      label: "Text completion",
      description: "Consults an LLM for a response with no further knowledge",
    },
    {
      value: "knowledge-query", label: "Knowledge query",
      description: "Uses the GraphRAG service for knowledge"
      },
  ];

  const contentRef = useRef<HTMLDivElement>(null);

  const onEdit = () => {
    // Build the tool structure
    const toolStruct = {
      description: description,
      type: type,
      arguments: args,
    };

    // Create is different from edit existing
    if (create) {
      // When creating, the order is...
      // 1) write the tool template,
      // 2) get the template index
      // 3) add this tool ID to the index if not already there

      socket
        .putConfig([
          {
            type: "agent",
            key: "tool." + newId,
            value: JSON.stringify(toolStruct),
          },
        ])
        .then(() =>
          socket.getConfig([{ type: "agent", key: "tool-index" }]),
        )
        .then((x) => {
          const tools = JSON.parse(x.values[0].value);

          if (!tools.includes(newId)) {
            tools.push(newId);
            return socket
              .putConfig([
                {
                  type: "agent",
                  key: "tool-index",
                  value: JSON.stringify(tools),
                },
              ])
              .then({});
          } else {
            return {};
          }
        })
        .then(() => {
          toaster.create({
            title: "Created tool",
            type: "success",
          });
          onComplete();
        })

        .catch((err) => {
          console.log("Error:", err);
          toaster.create({
            title: "Error: " + err.toString(),
            type: "error",
          });
        });
    } else {
      // This is the case for updating an existing template, just over-write
      // its value.
      return socket
        .putConfig([
          {
            type: "agent",
            key: "tool." + id,
            value: JSON.stringify(toolStruct),
          },
        ])
        .then(() => {
          toaster.create({
            title: "Edited tool",
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
    }
  };

  const onEditArg = (arg) => {
    setArgEdit(arg.name);
  }

  const onDelete = () => {
    // Shouldn't happen, but can't delete a tool that hasn't been created
    // yet
    if (create) return;

    // When creating, the order is...
    // 1) Get the tool index
    // 2) Write back
    // 3) Delete the tool

    socket
      .getConfig([{ type: "agent", key: "tool-index" }])
      .then((x) => {
        const tools = JSON.parse(x.values[0].value);

        const newTools = tools.filter((x) => x !== id);

        return socket.putConfig([
          {
            type: "agent",
            key: "tool-index",
            value: JSON.stringify(newTools),
          },
        ]);
      })
      .then(() =>
        socket.deleteConfig([
          {
            type: "agent",
            key: "tool." + id,
          },
        ]),
      )
      .then(() => {
        toaster.create({
          title: "Tool deleted",
          type: "success",
        });
        onComplete();
      })
      .catch((err) => {
        console.log("Error:", err);
        toaster.create({
          title: "Error: " + err.toString(),
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
          <Dialog.Content ref={contentRef}>
            <Dialog.Header>
              {create && <Dialog.Title>Create tool</Dialog.Title>}

              {!create && (
                <Dialog.Title>
                  Edit tool: <code>{id}</code>
                </Dialog.Title>
              )}
            </Dialog.Header>
            <Dialog.Body>

              {create && (
                <TextField
                  label="Tool ID"
                  placeholder="Enter a unique tool ID"
                  value={newId}
                  onValueChange={(v) => setNewId(v)}
                  required={true}
                />
              )}

              <TextAreaField
                label="Description"
                placeholder="Description"
                value={description}
                onValueChange={(v) => setDescription(v)}
                required={true}
              />

              <SelectField
                label="Tool type"
                items={typeOptions}
                value={type}
                onValueChange={(v) => setType(v)}
                contentRef={contentRef}
              />

              <Table.Root interactive>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Name</Table.ColumnHeader>  
                    <Table.ColumnHeader>Description</Table.ColumnHeader>
                    <Table.ColumnHeader>Type</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {args.map(
                    (arg) =>
                      <Table.Row key={arg.name}
                        onClick={ () => onEditArg(arg)}
                      >
                        <Table.Cell>
                          <Editable.Root
                            value={arg.name}
                            onValueChange={ (e) => console.log(e) }
                          >
                            <Editable.Preview />
                            <Editable.Input />
                          </Editable.Root>
                        </Table.Cell>
                        <Table.Cell>
                          <Editable.Root
                            value={arg.description}
                            onValueChange={ (e) => console.log(e) }
                          >
                            <Editable.Preview />
                            <Editable.Input />
                          </Editable.Root>
                        </Table.Cell>
                        <Table.Cell>
                          {arg.type}
                        </Table.Cell>
                      </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>

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
