import React, { useState, useEffect } from "react";

import {
  Text,
  Box,
  Stack,
  Popover,
  Portal,
  VStack,
  RadioCard,
} from "@chakra-ui/react";

import { useProgressStateStore } from "../../state/progress";
import { useSessionStore } from "../../state/session";
import { toaster } from "../ui/toaster";
import { useSocket } from "../../api/trustgraph/socket";

const FlowSelector = () => {
  const flowId = useSessionStore((state) => state.flowId);
  const flow = useSessionStore((state) => state.flow);

  const setFlowId = useSessionStore((state) => state.setFlowId);
  const setFlow = useSessionStore((state) => state.setFlow);

  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  const [flows, setFlows] = useState([]);

  const socket = useSocket();

  const refresh = (socket) => {
    const act = "Load flows";
    addActivity(act);
    socket
      .flows()
      .getFlows()
      .then((ids) => {
        return Promise.all(
          ids.map((id) => socket.flows().getFlow(id).then((x) => [id, x])),
        );
      })
      .then((x) => {
        removeActivity(act);
        setFlows(x);
      })
        .catch((err) => {
      removeActivity(act);
      toaster.create({
        title: "Error: " + err.toString(),
        type: "error",
      });
      console.log("Error:", err);
    });
  };

  useEffect(() => {
    refresh(socket);
  }, [socket]);

  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)} size="xl">
      <Popover.Trigger asChild>
        <Stack
          p={2}
          mr={8}
          borderWidth="1px"
          borderRadius="8px"
          borderColor="border.inverted/20"
          color="fg.muted"
          backgroundColor="brand.bg"
          _hover={{
            backgroundColor: "bg.emphasized",
            borderColor: "border.inverted",
            color: "fg",
          }}
          onClick={() => setOpen(true)}
        >
          <Box>
            <Text fontWeight="bold">{flowId ? flowId : "<none>"}</Text>
          </Box>
          <Box>
            <Text textStyle="xs">{flow ? flow.description : "<none>"}</Text>
          </Box>
        </Stack>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Body>
              <RadioCard.Root
                value={flowId}
                onValueChange={(x) => {
                  setFlowId(x.value);
                  const fl = flows.filter((fl) => fl[0] === x.value);
                  if (fl) setFlow(fl[0][1]);
                }}
              >
                <RadioCard.Label>Select flow</RadioCard.Label>
                <VStack columns={[2, null, 3]} gap="0.2rem">
                  {flows.map((flow) => {
                    return (
                      <RadioCard.Item
                        key={flow[0]}
                        value={flow[0]}
                        minWidth="20rem"
                      >
                        <RadioCard.ItemHiddenInput />
                        <RadioCard.ItemControl>
                          <RadioCard.ItemText>
                            <Stack>
                              <Box>
                                <Text fontWeight="semibold">{flow[0]}</Text>
                              </Box>
                              <Box>
                                <Text textStyle="xs">
                                  {flow[1].description}
                                </Text>
                              </Box>
                            </Stack>
                          </RadioCard.ItemText>
                          <RadioCard.ItemIndicator />
                        </RadioCard.ItemControl>
                      </RadioCard.Item>
                    );
                  })}
                </VStack>
              </RadioCard.Root>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export default FlowSelector;
