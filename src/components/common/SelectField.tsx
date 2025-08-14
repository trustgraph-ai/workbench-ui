import React, { useMemo } from "react";
import {
  Field,
  Select,
  Portal,
  Stack,
  createListCollection,
} from "@chakra-ui/react";

export interface SelectFieldValue {
  value: string;
  label: string;
  description?: string | React.ReactElement;
}

interface SelectFieldProps {
  label: string;

  items: SelectFieldValue[];

  value: string;
  onValueChange: (x: string) => void;

  contentRef?;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  items,
  value,
  onValueChange,
  contentRef,
}) => {

  // Debug logging
  console.log("SelectField render:", {
    label,
    value,
    valueType: typeof value,
    itemsLength: items.length,
    itemValues: items.map(i => i.value)
  });

  // Only create new collection when items actually change
  const collection = useMemo(() => 
    createListCollection({ items: items }), 
    [items]
  );

  // Debug items before rendering
  console.log("SelectField items debug:", {
    items: items.map(item => ({ 
      value: item.value, 
      valueType: typeof item.value,
      hasValue: !!item.value,
      isUndefined: item.value === undefined,
      isNull: item.value === null,
      isEmpty: item.value === ""
    }))
  });

  return (
    <Field.Root mb={4}>
      <Field.Label fontWeight="medium">{label}</Field.Label>

      <Select.Root
        collection={collection}
        value={value}
        onValueChange={(e) => onValueChange(e.value)}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder={label} />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal container={contentRef}>
          <Select.Positioner>
            <Select.Content>
              {items.map((v) => {
                console.log("Rendering Select.Item:", {
                  value: v.value,
                  key: v.value,
                  hasValue: !!v.value,
                  itemProp: v.value
                });
                return (
                  <Select.Item item={v.value} key={v.value}>
                    <Stack>{v.description && v.description}</Stack>
                    <Select.ItemIndicator />
                  </Select.Item>
                );
              })}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </Field.Root>
  );
};

export default SelectField;
