import React, { useState, useEffect } from "react";

import { Flex, Heading, Text, Box, HStack } from "@chakra-ui/react";

import ColorModeToggle from "../color-mode-toggle";
import { useSocket } from "../../api/trustgraph/socket";
import { useProgressStateStore } from "../../state/progress";
import { useSessionStore } from "../../state/session";

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
}) => {
  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  const [flows, setFlows] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState(null);

  const socket = useSocket();

  const flow = useSessionStore((state) => state.flow);
  const setFlow = useSessionStore((state) => state.setFlow);

  const refresh = (socket) => {
    const act = "Load flows";
    addActivity(act);
    socket
      .getFlows()
      .then((ids) => {
        return Promise.all(
          ids.map((id) => socket.getFlow(id).then((x) => [id, x])),
        );
      })
      .then((flows) => {
        console.log("UPDATE HDR");
        removeActivity(act);

        setFlows(flows);

        const flowIds = flows.map((fl) => fl[0]);

        if (flowIds.includes(flow)) {
          setSelectedFlow(flows.filter((fl) => fl[0] != flow)[0]);
        } else {
          setSelectedFlow(null);
        }
      })
      .catch((err) => {
        removeActivity(act);
        console.log("Error:", err);
      });
  };

  useEffect(() => {
    refresh(socket);
  }, [socket]);

  const flowDescription = flows.filter;

  return (
    <Flex
      mb={8}
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      px={1}
      py={1}
    >
      <Flex alignItems="center">
        {icon && (
          <Box mr={4} color="{colors.brand.fg}" fontSize="xl">
            {icon}
          </Box>
        )}
        <Box>
          <Heading
            as="h1"
            size="xl"
            color="{colors.brand.fg}"
            fontWeight="bold"
          >
            {title}
          </Heading>
          <Text mt={1} fontSize="md" color="{colors.brand.emphasized}">
            {description}
          </Text>
        </Box>
      </Flex>
      <Box>
        <HStack>
          <Box mr={5}>
            {selectedFlow ? selectedFlow[0] : "<none>"}
            {selectedFlow ? " : " + selectedFlow[1].description : "<none>"}
          </Box>
          <ColorModeToggle />
        </HStack>
      </Box>
    </Flex>
  );
};

export default PageHeader;
