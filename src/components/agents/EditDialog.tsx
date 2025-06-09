import React, { useEffect, useState, useRef } from "react";

import { Trash, SendHorizontal, Plus } from "lucide-react";

import {
  Portal,
  Button,
  Dialog,
  Box,
  CloseButton,
  Table,
  Editable,
  Popover,
  Text,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";

import { useSocket } from "../../api/trustgraph/socket";
import { useAgentTools } from "../../state/agent-tools";
import SelectField from "../common/SelectField";
import TextAreaField from "../common/TextAreaField";
import TextField from "../common/TextField";
import { toaster } from "../ui/toaster";

const EditDialog = ({ open, onOpenChange, onComplete, id, create }) => {
  const socket = useSocket();
  const { updateTool, createTool, deleteTool } = useAgentTools();

  const [newId, setNewId] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("knowledge-query");
  const [args, setArgs] = useState([]);

  const [editArgIx, setEditArgIx] = useState(-1);

  useEffect(() => {
    if (!id) return;

    socket
      .config()
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
      value: "knowledge-query",
      label: "Knowledge query",
      description: "Uses the GraphRAG service for knowledge",
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

    if (create) {
      createTool({ id: newId, tool: toolStruct, onSuccess: onComplete });
    } else {
      updateTool({ id, tool: toolStruct, onSuccess: onComplete });
    }
  };

  const addArgument = () => {
    setArgs((x) => [
      ...x,
      {
        name: "argname",
        description: "???",
        type: "string",
      },
    ]);
  };

  const setArgAttr = (id, key, value) => {
    const newArgs = args.map((arg, ix) => {
      if (id == ix) {
        return {
          ...arg,
          [key]: value,
        };
      } else {
        return arg;
      }
    });
    setArgs(newArgs);
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
                label="Description of the tool"
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

              <Table.Root interactive size="xs">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Name</Table.ColumnHeader>
                    <Table.ColumnHeader>Description</Table.ColumnHeader>
                    <Table.ColumnHeader>Type</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {args.map((arg, ix) => (
                    <Table.Row key={ix}>
                      <Table.Cell width="20%">
                        <Editable.Root
                          autoResize={false}
                          value={arg.name}
                          onValueChange={(v) =>
                            setArgAttr(ix, "name", v.value)
                          }
                        >
                          <Editable.Preview />
                          <Editable.Input />
                        </Editable.Root>
                      </Table.Cell>
                      <Table.Cell width="50%">
                        <Editable.Root
                          value={arg.description}
                          onValueChange={(v) =>
                            setArgAttr(ix, "description", v.value)
                          }
                        >
                          <Editable.Preview />
                          <Editable.Input />
                        </Editable.Root>
                      </Table.Cell>
                      <Table.Cell
                        onClick={() => {
                          setEditArgIx(ix);
                        }}
                      >
                        {editArgIx == ix && (
                          <Popover.Root
                            open={editArgIx == ix}
                            onOpenChange={(e) => {
                              if (e) setEditArgIx(-1);
                            }}
                          >
                            <Popover.Trigger asChild>
                              <Text>{arg.type}</Text>
                            </Popover.Trigger>
                            <Popover.Positioner>
                              <Popover.Content>
                                <Popover.Arrow />
                                <Popover.Body>
                                  <RadioGroup.Root
                                    value={args[ix].type}
                                    onValueChange={(v) =>
                                      setArgAttr(ix, "type", v.value)
                                    }
                                  >
                                    <Stack gap="6">
                                      <RadioGroup.Item value={"string"}>
                                        <RadioGroup.ItemHiddenInput />
                                        <RadioGroup.ItemIndicator />
                                        <RadioGroup.ItemText>
                                          string
                                        </RadioGroup.ItemText>
                                      </RadioGroup.Item>
                                      <RadioGroup.Item value={"number"}>
                                        <RadioGroup.ItemHiddenInput />
                                        <RadioGroup.ItemIndicator />
                                        <RadioGroup.ItemText>
                                          number
                                        </RadioGroup.ItemText>
                                      </RadioGroup.Item>
                                    </Stack>
                                  </RadioGroup.Root>
                                </Popover.Body>
                              </Popover.Content>
                            </Popover.Positioner>
                          </Popover.Root>
                        )}
                        {editArgIx != ix && arg.type}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              <Box mt={5}>
                <Button
                  variant="solid"
                  onClick={() => addArgument()}
                  colorPalette="brand"
                  size="xs"
                >
                  <Plus /> add argument
                </Button>
              </Box>
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
