
import React, { PropsWithChildren } from 'react';
import {
    Box, SimpleGrid, Select, Field, Slider, NumberInput, Portal, Stack,
    Span, Image, Flex, Heading, Text, createListCollection, Center,
    AbsoluteCenter
} from '@chakra-ui/react';

const SelectOption : React.FC<PropsWithChildren<{
    title : string,
    badge? : any,
    description? : string | React.ReactNode
}>> = ({
    description, title, badge, children
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

