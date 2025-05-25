import React, { useState } from "react";

import {
  Text,
  Box,
  Stack,
  Popover,
  Portal,
} from "@chakra-ui/react";

import { useSessionStore } from "../../state/session";

const FlowSelector = () => {
  const flowId = useSessionStore((state) => state.flowId);
  const flow = useSessionStore((state) => state.flow);

  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
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
              This is a popover with the same width as the trigger button
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export default FlowSelector;
