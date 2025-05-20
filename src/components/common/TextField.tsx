
import React from 'react';
import {
  Box, Field, Flex, Heading, Text, Select, Portal, Stack, Span,
  Input
} from '@chakra-ui/react';

interface TextFieldProps {
  label: string,
  placeholder? : string,
  value : string;
  onValueChange : (x : string) => void;
  required? : boolean;
  helperText? : string;
}

const TextField : React.FC<TextFieldProps> = ({
  label,
  placeholder,
  value,
  onValueChange,
  required,
  helperText,
}) => {

  return (
    <Field.Root mb={4} required={required}
    >
      <Field.Label>
        {label} {required && <Field.RequiredIndicator />}
      </Field.Label>
      <Input
        value={value}
        onChange={ (e) => onValueChange(e.target.value) }
        placeholder={placeholder} variant="subtle"
      />
      { (helperText) && <Field.HelperText>{helperText}</Field.HelperText> }
    </Field.Root>
  );

};

export default TextField;

