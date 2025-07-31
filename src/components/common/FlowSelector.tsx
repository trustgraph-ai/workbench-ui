import { useState } from "react";

import {
  Text,
  Box,
  Stack,
  Popover,
  Portal,
  RadioGroup,
} from "@chakra-ui/react";

import { useSessionStore } from "../../state/session";
import { useFlows } from "../../state/flows";

const FlowSelector = () => {
  const flowState = useFlows();
  const flows = flowState.flows ? flowState.flows : [];

  const flowId = useSessionStore((state) => state.flowId);
  const flow = useSessionStore((state) => state.flow);

  const setFlowId = useSessionStore((state) => state.setFlowId);
  const setFlow = useSessionStore((state) => state.setFlow);

  const [open, setOpen] = useState(false);

  return (
    <Popover.Root
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      size="xl"
      positioning={{ placement: "bottom-end" }}
    >
      <Popover.Trigger asChild>
        <Stack
          p={3}
          mr={8}
          gap={1}
          borderWidth="1px"
          borderRadius="8px"
          borderColor="border.inverted/20"
          color="fg.muted"
          backgroundColor="primary.bg"
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
              <Box>
                <RadioGroup.Root
                  p={5}
                  value={flowId}
                  onValueChange={(x) => {
                    setFlowId(x.value);
                    const fl = flows.filter((fl) => fl.id == x.value);
                    if (fl) setFlow(fl[0]);
                  }}
                >
                  <RadioGroup.Label>Select flow</RadioGroup.Label>
                  <Stack gap="1">
                    {flows.map((flow) => {
                      return (
                        <RadioGroup.Item key={flow.id} value={flow.id}>
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemIndicator />
                          <RadioGroup.ItemText>
                            <Stack mt={3} gap={1}>
                              <Box>
                                <Text fontWeight="semibold">{flow.id}</Text>
                              </Box>
                              <Box>
                                <Text textStyle="xs">{flow.description}</Text>
                              </Box>
                            </Stack>
                          </RadioGroup.ItemText>
                        </RadioGroup.Item>
                      );
                    })}
                  </Stack>
                </RadioGroup.Root>
              </Box>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export default FlowSelector;
