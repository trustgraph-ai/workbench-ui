import React, { useEffect, useState } from "react";

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

const SubmitDialog = ({ open, onOpenChange, docs }) => {
  const [flows, setFlows] = useState([]);
  const [flow, setFlow] = useState("");

  const socket = useSocket();

  useEffect(() => {
    socket
      .getFlows()
      .then((ids) => {
        return Promise.all(
          ids.map((id) => socket.getFlow(id).then((x) => [id, x])),
        );
      })
      .then((x) => setFlows(x))
      .catch((err) => console.log("Error:", err));
  }, [socket]);

  const flowOptions = flows.map((flow) => {
    return {
      value: flow[0],
      label: flow[0],
      description: <SelectOptionText>{flow[1].description}</SelectOptionText>,
    };
  });

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
          <Dialog.Content>
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
                />
              </Box>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => onOpenChange(false)}>Submit</Button>
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
