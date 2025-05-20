
import React, { PropsWithChildren } from 'react';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';

const SelectOption : React.FC<PropsWithChildren<{
    title : string,
    badge? : React.ReactNode,
}>> = ({
    title, badge, children
}) => {
  return (
    <Box>
      <Flex alignItems="center">
        <Heading as="h1" size="sm" color="fg" fontWeight="bold">
          {title}
        </Heading>
        {badge && badge}
      </Flex>
      <Text mt={1} textStyle="xs" color="fg.muted">
        {children}
      </Text>
    </Box>
  );  
};

export default SelectOption;

