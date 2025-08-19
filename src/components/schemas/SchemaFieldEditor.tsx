import React from "react";
import {
  Box,
  HStack,
  Field,
  Input,
  Checkbox,
  IconButton,
  Text,
  Button,
  Badge,
  Flex,
  CloseButton,
} from "@chakra-ui/react";
import { Trash2 } from "lucide-react";
import { SchemaField } from "../../model/schemas-table";
import SelectField from "../common/SelectField";

const typeOptions = [
  {
    value: "string",
    label: "String",
    description: "Text data of variable length",
  },
  {
    value: "integer",
    label: "Integer",
    description: "Whole numbers (e.g., 1, 42, -10)",
  },
  {
    value: "float",
    label: "Float",
    description: "Decimal numbers (e.g., 3.14, -2.5)",
  },
  {
    value: "boolean",
    label: "Boolean",
    description: "True or false values",
  },
  {
    value: "timestamp",
    label: "Timestamp",
    description: "Date and time values",
  },
  {
    value: "enum",
    label: "Enum",
    description: "Predefined set of allowed values",
  },
];

interface SchemaFieldEditorProps {
  field: SchemaField;
  index: number;
  onFieldChange: (index: number, field: Partial<SchemaField>) => void;
  onRemoveField: (index: number) => void;
  onAddEnumValue: (fieldIndex: number, value: string) => void;
  onRemoveEnumValue: (fieldIndex: number, value: string) => void;
  canRemove: boolean;
  contentRef: React.RefObject<HTMLDivElement>;
}

export const SchemaFieldEditor: React.FC<SchemaFieldEditorProps> = ({
  field,
  index,
  onFieldChange,
  onRemoveField,
  onAddEnumValue,
  onRemoveEnumValue,
  canRemove,
  contentRef,
}) => {
  return (
    <Box p={4} borderWidth="1px" borderRadius="md">
      <HStack gap={4} mb={3}>
        <Field.Root required flex={1}>
          <Field.Label>
            Field Name <Field.RequiredIndicator />
          </Field.Label>
          <Input
            value={field.name}
            onChange={(e) =>
              onFieldChange(index, {
                name: e.target.value,
              })
            }
            placeholder="e.g., customer_id"
          />
        </Field.Root>

        <Box flex={1}>
          <SelectField
            label="Type"
            value={field.type ? [field.type] : []}
            onValueChange={(value) => {
              const typeValue = Array.isArray(value) ? value[0] : value;
              onFieldChange(index, {
                type: typeValue as SchemaField["type"],
              });
            }}
            items={typeOptions}
            contentRef={contentRef}
          />
        </Box>

        <IconButton
          aria-label="Remove field"
          size="sm"
          colorPalette="red"
          variant="ghost"
          onClick={() => onRemoveField(index)}
          disabled={!canRemove}
        >
          <Trash2 size={16} />
        </IconButton>
      </HStack>

      <HStack gap={4}>
        <Checkbox.Root
          checked={field.primary_key}
          onCheckedChange={(details) =>
            onFieldChange(index, {
              primary_key: details.checked,
            })
          }
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Label>Primary Key</Checkbox.Label>
        </Checkbox.Root>

        <Checkbox.Root
          checked={field.required}
          onCheckedChange={(details) =>
            onFieldChange(index, {
              required: details.checked,
            })
          }
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Label>Required</Checkbox.Label>
        </Checkbox.Root>
      </HStack>

      {field.type === "enum" && (
        <Box mt={3}>
          <Text>Enum Values</Text>
          <HStack mb={2}>
            <Input
              placeholder="Add enum value"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  onAddEnumValue(index, (e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = "";
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                const input = document.querySelector(
                  `input[placeholder="Add enum value"]`,
                ) as HTMLInputElement;
                if (input) {
                  onAddEnumValue(index, input.value);
                  input.value = "";
                }
              }}
              colorPalette="primary"
            >
              Add
            </Button>
          </HStack>
          <Flex wrap="wrap" gap={2}>
            {(field.enum || []).map((value) => (
              <Badge
                key={value}
                colorPalette="accent"
                borderRadius="full"
                px={3}
                py={1}
                display="flex"
                alignItems="center"
                gap={2}
              >
                {value}
                <CloseButton
                  size="sm"
                  onClick={() => onRemoveEnumValue(index, value)}
                />
              </Badge>
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
};