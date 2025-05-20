
import React from 'react';
import { Field, NumberInput } from '@chakra-ui/react';

interface NumberFieldProps {

  label: string,

  minValue : number;
  maxValue : number;
  value : number;
  onValueChange : (x : number) => void;

}

const NumberField : React.FC<NumberFieldProps> = ({
  label,
  minValue,
  maxValue,
  value,
  onValueChange,
}) => {

  return (
    <Field.Root mb={4}>
      <Field.Label fontWeight="medium">{label}</Field.Label>
      <NumberInput.Root
        min={minValue} max={maxValue}
        value={value.toString()}
        onValueChange={(e) => onValueChange(Number(e.value))}>
        <NumberInput.Input />
        <NumberInput.Control>
          <NumberInput.IncrementTrigger />
          <NumberInput.DecrementTrigger />
        </NumberInput.Control>
      </NumberInput.Root>
    </Field.Root>
  );

};

export default NumberField;

