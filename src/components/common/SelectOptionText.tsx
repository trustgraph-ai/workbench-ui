
import { PropsWithChildren } from 'react';
import { Text } from '@chakra-ui/react';

const SelectOptionText : React.FC<PropsWithChildren<{
}>> = ({
    children
}) => {
  return (
    <Text mt={1} textStyle="xs" color="fg.muted">
      {children}
    </Text>
  );
};

export default SelectOptionText;

