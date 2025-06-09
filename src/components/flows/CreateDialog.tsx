import React, { useState, useRef } from "react";

import { Plus } from "lucide-react";

import { Portal, Button, Dialog, Box, CloseButton } from "@chakra-ui/react";

import { useFlows } from "../../state/flows";
import SelectField from "../common/SelectField";
import SelectOption from "../common/SelectOption";
import TextField from "../common/TextField";

const CreateDialog = ({ open, onOpenChange }) => {
  const flowState = useFlows();

  const flowClasses = flowState.flowClasses ? flowState.flowClasses : [];

  const [flowClass, setFlowClass] = useState(undefined);
  const [id, setId] = useState("");
  const [description, setDescription] = useState("");

  const onSubmit = () => {
    flowState.startFlow({
      id: id,
      flowClass: flowClass,
      description: description,
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

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
              <Button onClick={() => onSubmit()} colorPalette="brand">
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
