import React, { useEffect, useState, useRef } from "react";

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
import SelectOptionText from "../common/SelectOptionText";
import SelectOption from "../common/SelectOption";

const SubmitDialog = ({ open, onOpenChange, onSubmit, docs }) => {
  const [flows, setFlows] = useState([]);

  const socket = useSocket();

  useEffect(() => {
    socket
      .getFlows()
      .then((ids) => {
        return Promise.all(
          ids.map((id) => socket.getFlow(id).then((x) => [id, x])),
        );
      })
      .then((x) => {
        // Store flow information
        setFlows(x);

        // Set selected flow to the first, if none set
        if (!flow && x.length > 0) setFlow(x[0][0]);
      })
      .catch((err) => console.log("Error:", err));
  }, [socket]);

  const flowOptions = flows.map((flow) => {
    return {
      value: flow[0],
      label: flow[1].description,
      description: (
        <SelectOption title={flow[1].description}>
          {flow[0]} (class {flow[1]["class-name"]})
        </SelectOption>
      ),
    };
  });

  const [flow, setFlow] = useState(undefined);

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
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => onSubmit(flow)}>Submit</Button>
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
