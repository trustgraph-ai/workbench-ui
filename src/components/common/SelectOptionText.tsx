
import React from 'react';
import { Text } from '@chakra-ui/react';

const SelectOptionText : React.FC<{
  children : React.ReactNode
}> = ({children}) => {
  return (
    <Text mt={1} textStyle="xs" color="fg.muted">
      {children}
    </Text>
  );
};

export default SelectOptionText;

