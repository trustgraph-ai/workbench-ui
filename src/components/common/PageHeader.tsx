import React, { useState, useEffect } from "react";

import { Flex, Heading, Text, Box, HStack, Stack } from "@chakra-ui/react";

import ColorModeToggle from "../color-mode-toggle";
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
  const flowId = useSessionStore((state) => state.flowId);
  const flow = useSessionStore((state) => state.flow);

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
          <Stack p={2} mr={8}
            _hover={{
              backgroundColor: "bg.emphasized",
              color: "brand.solid",
            }}
          >
            <Box>
              <Text fontWeight="bold">{flowId ? flowId : "<none>"}</Text>
            </Box>
            <Box>
              <Text textStyle="xs">{flow ? flow.description : "<none>"}</Text>
            </Box>
          </Stack>
          <ColorModeToggle />
        </HStack>
      </Box>
    </Flex>
  );
};

export default PageHeader;
