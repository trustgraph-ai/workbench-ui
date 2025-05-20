
import React from 'react';

import {
  Flex, Heading, Text, Box
} from '@chakra-ui/react';

import ColorModeToggle from "../color-mode-toggle"

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon
}) => {

  return (
    <Flex mb={8} alignItems="center" justifyContent="space-between"
      width="100%" px={1} py={1}
    >
      <Flex alignItems="center">
        {
          icon &&
          <Box mr={4} color="{colors.brand.fg}" fontSize="xl">
            {icon}
          </Box>
        }
        <Box>
          <Heading as="h1" size="xl" color="{colors.brand.fg}" fontWeight="bold">
            {title}
          </Heading>
          <Text mt={1} fontSize="md" color="{colors.brand.emphasized}">
            {description}
          </Text>
        </Box>
      </Flex>
      <Box>
        <Flex>
          <ColorModeToggle />
        </Flex>
      </Box>
    </Flex>
  );

};

export default PageHeader;

