import React, { useEffect, useState, useRef } from "react";

import { Plus } from "lucide-react";

import { Portal, Button, Dialog, Box, CloseButton } from "@chakra-ui/react";

import { useSocket } from "../../api/trustgraph/socket";
import SelectField from "../common/SelectField";
import SelectOption from "../common/SelectOption";
import TextField from "../common/TextField";

const CreateDialog = ({ open, onOpenChange, onSubmit }) => {
  const [flowClasses, setFlowClasses] = useState([]);

  const [flowClass, setFlowClass] = useState(undefined);
  const [id, setId] = useState("");
  const [description, setDescription] = useState("");

  const socket = useSocket();

  useEffect(() => {
    socket
      .flows()
      .getFlowClasses()
      .then((ids) => {
        return Promise.all(
          ids.map((id) =>
            socket
              .flows()
              .getFlowClass(id)
              .then((x) => [id, x]),
          ),
        );
      })
      .then((x) => {
        // Store flow information
        setFlowClasses(x);

        // Set selected flow to the first, if none set
        if (!flowClass && x.length > 0) setFlowClass(x[0][0]);
      })
      .catch((err) => console.log("Error:", err));
  }, [socket, flowClass]);

  const flowClassOptions = flowClasses.map((flowClass) => {
    return {
      value: flowClass[0],
      label: flowClass[1].description,
      description: (
        <SelectOption title={flowClass[1].description}>
          {flowClass[0]}
        </SelectOption>
      ),
    };
  });

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog.Root
      placement="center"
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
              <Dialog.Title>Submit documents for processing</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Box>Submit the following documents:</Box>

              <Box mt={5}>With following flow classes:</Box>

              <Box mt={5}>
                <SelectField
                  label="Processing flow"
                  items={flowClassOptions}
                  value={flowClass}
                  onValueChange={(x) => {
                    setFlowClass(x);
                  }}
                  contentRef={contentRef}
                />
              </Box>

              <TextField
                label="ID"
                helperText="A unique ID for your flow"
                values={id}
                onValueChange={setId}
              />

              <TextField
                label="Description"
                helperText="A human-readable description"
                values={description}
                onValueChange={setDescription}
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => onSubmit(flowClass, id, description)}
                colorPalette="brand"
              >
                <Plus /> Create
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

export default CreateDialog;
