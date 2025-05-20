
import React from 'react';

import { Field, Textarea } from '@chakra-ui/react';

interface TextFieldProps {
  label: string,
  placeholder? : string,
  value : string;
  onValueChange : (x : string) => void;
  required? : boolean;
}

const TextAreaField : React.FC<TextFieldProps> = ({
  label,
  placeholder,
  value,
  onValueChange,
  required,
}) => {

  return (
    <Field.Root mb={4} required={required}>
      <Field.Label>
        {label} {required && <Field.RequiredIndicator />}
      </Field.Label>
      <Textarea
        placeholder={placeholder} variant="subtle"
        value={value}
        onChange={ (e) => onValueChange(e.target.value) }
        maxH="30lh" h="10lh"
      />
    </Field.Root>
  );

};

export default TextAreaField;

