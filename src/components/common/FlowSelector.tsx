import { useState } from "react";

import {
  Text,
  Box,
  Stack,
  HStack,
  Popover,
  Portal,
  RadioGroup,
} from "@chakra-ui/react";

import { Database, Workflow } from "lucide-react";

import { useSessionStore } from "../../state/session";
import { useFlows } from "../../state/flows";
import { useSettings } from "../../state/settings";

const FlowSelector = () => {
  const flowState = useFlows();
  const flows = flowState.flows ? flowState.flows : [];

  const flowId = useSessionStore((state) => state.flowId);
  const flow = useSessionStore((state) => state.flow);

  const setFlowId = useSessionStore((state) => state.setFlowId);
  const setFlow = useSessionStore((state) => state.setFlow);

  const { settings } = useSettings();

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
          gap={2}
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
          cursor="pointer"
        >
          <HStack gap={2} align="center">
            <Database size={14} />
            <Text fontSize="xs" fontWeight="medium">{settings.collection}</Text>
          </HStack>
          
          <HStack gap={2} align="center">
            <Workflow size={14} />
            <Text fontSize="xs" fontWeight="medium">{flowId || "<none>"}</Text>
          </HStack>
        </Stack>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Body>
              <Stack gap={4} p={4}>
                {/* Current Information Display */}
                <Stack gap={3}>
                  <Text fontWeight="semibold" fontSize="sm" color="fg.muted">
                    Current Settings
                  </Text>
                  
                  <HStack gap={3} align="center">
                    <Database size={16} color="currentColor" />
                    <Box flex="1">
                      <Text fontSize="sm" fontWeight="medium">Collection</Text>
                      <Text fontSize="xs" color="fg.muted">{settings.collection}</Text>
                    </Box>
                  </HStack>
                </Stack>

                {/* Flow Selection */}
                <Box borderTopWidth="1px" borderColor="border.subtle" pt={4}>
                  <RadioGroup.Root
                    value={flowId}
                    onValueChange={(x) => {
                      setFlowId(x.value);
                      const fl = flows.filter((fl) => fl.id == x.value);
                      if (fl) setFlow(fl[0]);
                    }}
                  >
                    <RadioGroup.Label>Select Flow</RadioGroup.Label>
                    <Stack gap="2" mt={2}>
                      {flows.map((flow) => {
                        return (
                          <RadioGroup.Item key={flow.id} value={flow.id}>
                            <RadioGroup.ItemHiddenInput />
                            <RadioGroup.ItemIndicator />
                            <RadioGroup.ItemText>
                              <Stack gap={1}>
                                <Box>
                                  <Text fontWeight="semibold" fontSize="sm">{flow.id}</Text>
                                </Box>
                                <Box>
                                  <Text fontSize="xs" color="fg.muted">{flow.description}</Text>
                                </Box>
                              </Stack>
                            </RadioGroup.ItemText>
                          </RadioGroup.Item>
                        );
                      })}
                    </Stack>
                  </RadioGroup.Root>
                </Box>
              </Stack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export default FlowSelector;
