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
    // Validate required fields before submission
    if (!flowClass || !id.trim() || !description.trim()) {
      return;
    }

    flowState.startFlow({
      id: id,
      flowClass: flowClass,
      description: description,
      onSuccess: () => {
        // Clear form after successful submission
        setFlowClass(undefined);
        setId("");
        setDescription("");
        onOpenChange(false);
      },
    });
  };

  // Check if form is valid for submission
  const isFormValid = flowClass && id.trim().length > 0 && description.trim().length > 0;

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
              <Dialog.Title>Create Flow</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Box mt={5}>Select flow class and configuration:</Box>

              <Box mt={5}>
                <SelectField
                  label="Flow class"
                  items={flowClassOptions}
                  value={flowClass ? [flowClass] : []}
                  onValueChange={(x) => {
                    // SelectField returns an array, extract the first element
                    setFlowClass(Array.isArray(x) ? x[0] : x);
                  }}
                  contentRef={contentRef}
                />
              </Box>

              <TextField
                label="ID"
                helperText="A unique ID for your flow"
                value={id}
                onValueChange={setId}
                required={true}
              />

              <TextField
                label="Description"
                helperText="A human-readable description"
                value={description}
                onValueChange={setDescription}
                required={true}
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => onSubmit()}
                colorPalette="primary"
                disabled={!isFormValid}
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
