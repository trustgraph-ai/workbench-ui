import React, { useState, useRef } from "react";

import { SendHorizontal } from "lucide-react";
import { useFlows } from "../../state/flows";

import {
  List,
  Portal,
  Button,
  Dialog,
  Box,
  CloseButton,
} from "@chakra-ui/react";

import SelectField from "../common/SelectField";
import SelectOption from "../common/SelectOption";
import ChipInputField from "../common/ChipInputField";

const SubmitDialog = ({ open, onOpenChange, onSubmit, docs }) => {
  const flowState = useFlows();
  const flows = flowState.flows ? flowState.flows : [];

  const flowOptions = flows.map((flow) => {
    return {
      value: flow.id,
      label: flow.description,
      description: (
        <SelectOption title={flow.description}>
          {flow[0]} (class {flow["class-name"]})
        </SelectOption>
      ),
    };
  });

  const [flow, setFlow] = useState(undefined);
  const [tags, setTags] = useState([]);

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

              <List.Root mt={5}>
                {docs.map((row) => (
                  <List.Item key={row.id} ml="1.5rem">
                    {row.title ? row.title : "<untitled>"}
                  </List.Item>
                ))}
              </List.Root>

              <Box mt={5}>With following flows:</Box>

              <Box mt={5}>
                <SelectField
                  label="Processing flow"
                  items={flowOptions}
                  value={flow}
                  onValueChange={(x) => {
                    setFlow(x);
                  }}
                  contentRef={contentRef}
                />
              </Box>

              <ChipInputField
                label="Tags"
                values={tags}
                onValuesChange={setTags}
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => onSubmit(flow, tags)}
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
