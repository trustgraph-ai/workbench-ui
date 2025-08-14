import React, { useRef } from "react";
import {
  Dialog,
  Portal,
  CloseButton,
  Button,
  Field,
  Input,
  Textarea,
  VStack,
  HStack,
  IconButton,
  Select,
  Checkbox,
  Box,
  Text,
  Separator,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { Plus, Trash2 } from "lucide-react";
import { useSchemas } from "../../state/schemas";
import { Schema, SchemaField } from "../../model/schemas-table";
import { validateSchema } from "../../utils/schema-validation";
import SelectField from "../common/SelectField";

// Type options moved outside component to prevent recreation on every render
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

interface EditSchemaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  schemaId?: string;
  initialSchema?: Schema;
}

export const EditSchemaDialog: React.FC<EditSchemaDialogProps> = ({
  isOpen,
  onClose,
  mode,
  schemaId,
  initialSchema,
}) => {
  const { createSchema, updateSchema, deleteSchema, schemas } = useSchemas();

  const [id, setId] = React.useState(schemaId || "");
  const [name, setName] = React.useState(initialSchema?.name || "");
  const [description, setDescription] = React.useState(
    initialSchema?.description || "",
  );
  const [fields, setFields] = React.useState<SchemaField[]>(
    initialSchema?.fields?.map(field => ({ 
      ...field, 
      id: field.id || crypto.randomUUID() 
    })) || [
      {
        id: crypto.randomUUID(),
        name: "",
        type: "string",
        primary_key: false,
        required: false,
      },
    ],
  );
  const [indexes, setIndexes] = React.useState<string[]>(
    initialSchema?.indexes || [],
  );
  const [newIndex, setNewIndex] = React.useState("");
  const [errors, setErrors] = React.useState<string[]>([]);

  // Debug logs
  console.log("EditSchemaDialog render:", {
    mode,
    fields,
    fieldsLength: fields.length,
    fieldTypes: fields.map((f) => ({
      name: f.name,
      type: f.type,
      typeOf: typeof f.type,
    })),
    indexes,
    newIndex,
  });

  fields.forEach((field, index) => {
    console.log(`Field ${index}:`, {
      name: field.name,
      type: field.type,
      typeOfType: typeof field.type,
      isUndefined: field.type === undefined,
      isNull: field.type === null,
      isEmptyString: field.type === "",
      actualValue: JSON.stringify(field.type),
    });
  });

  const handleAddField = () => {
    setFields([
      ...fields,
      {
        id: crypto.randomUUID(),
        name: "",
        type: "string",
        primary_key: false,
        required: false,
      },
    ]);
  };

  const handleRemoveField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    // Remove field from indexes if it exists
    const removedFieldName = fields[index].name;
    setIndexes(indexes.filter((idx) => idx !== removedFieldName));
  };

  const handleFieldChange = (index: number, field: Partial<SchemaField>) => {
    console.log("CHANGE", index, field);

    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...field };

    // Clear enum values if type is not enum
    if (field.type && field.type !== "enum") {
      delete newFields[index].enum;
    }

    // Debug: Check if ID is preserved
    console.log("NOW>", newFields);
    console.log("Field ID check:", {
      index,
      hasId: !!newFields[index].id,
      id: newFields[index].id,
      type: newFields[index].type,
      typeOf: typeof newFields[index].type
    });

    setFields(newFields);
  };

  const handleAddIndex = () => {
    if (newIndex && !indexes.includes(newIndex)) {
      setIndexes([...indexes, newIndex]);
      setNewIndex("");
    }
  };

  const handleRemoveIndex = (index: string) => {
    setIndexes(indexes.filter((idx) => idx !== index));
  };

  const handleAddEnumValue = (fieldIndex: number, value: string) => {
    if (value.trim()) {
      const field = fields[fieldIndex];
      const enumValues = field.enum || [];
      if (!enumValues.includes(value.trim())) {
        handleFieldChange(fieldIndex, {
          enum: [...enumValues, value.trim()],
        });
      }
    }
  };

  const handleRemoveEnumValue = (fieldIndex: number, value: string) => {
    const field = fields[fieldIndex];
    const enumValues = field.enum || [];
    handleFieldChange(fieldIndex, {
      enum: enumValues.filter((v) => v !== value),
    });
  };

  const handleSave = async () => {
    const schema: Schema = {
      name,
      description,
      fields,
      indexes: indexes.length > 0 ? indexes : undefined,
    };

    // Validate schema
    const validationErrors = validateSchema(
      schema,
      schemas,
      mode === "create" ? id : undefined,
    );
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (mode === "create") {
        createSchema({
          id,
          schema,
          onSuccess: () => {
            onClose();
            setId("");
            setName("");
            setDescription("");
            setFields([
              {
                id: crypto.randomUUID(),
                name: "",
                type: "string",
                primary_key: false,
                required: false,
              },
            ]);
            setIndexes([]);
            setErrors([]);
          },
        });
      } else {
        updateSchema({
          id: schemaId!,
          schema,
          onSuccess: () => {
            onClose();
            setErrors([]);
          },
        });
      }
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error("Error saving schema:", error);
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the schema "${name}"?`)) {
      deleteSchema({
        id: schemaId!,
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const contentRef = useRef<HTMLDivElement>(null);
  
  // Debug: Track contentRef changes
  React.useEffect(() => {
    console.log("contentRef.current changed:", {
      hasValue: !!contentRef.current,
      element: contentRef.current,
      elementId: contentRef.current?.id,
      elementTagName: contentRef.current?.tagName
    });
  }, [contentRef.current]);
  
  // Debug: Track component lifecycle
  React.useEffect(() => {
    console.log("EditSchemaDialog mounted/updated");
    return () => {
      console.log("EditSchemaDialog cleanup");
    };
  });
  

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
      size="xl"
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content ref={contentRef}>
            <Dialog.Header>
              <Dialog.Title>
                {mode === "create" ? "Create New Schema" : "Edit Schema"}
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body overflowY="auto">
              <VStack gap={6} align="stretch">
                {errors.length > 0 && (
                  <Box
                    p={4}
                    borderWidth="1px"
                    borderColor="red.500"
                    borderRadius="md"
                    bg="red.50"
                  >
                    <Text color="red.700" fontWeight="bold" mb={2}>
                      Please fix the following errors:
                    </Text>
                    {errors.map((error, i) => (
                      <Text key={i} color="red.600" fontSize="sm">
                        • {error}
                      </Text>
                    ))}
                  </Box>
                )}

                {mode === "create" && (
                  <Field.Root required>
                    <Field.Label>
                      Schema ID <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      placeholder="e.g., customer_records"
                    />
                  </Field.Root>
                )}

                <Field.Root required>
                  <Field.Label>
                    Name <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Customer Records"
                  />
                </Field.Root>

                <Field.Root required>
                  <Field.Label>
                    Description <Field.RequiredIndicator />
                  </Field.Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the purpose of this schema"
                  />
                </Field.Root>

                <Separator />

                <Box>
                  <HStack justify="space-between" mb={4}>
                    <Text fontSize="lg" fontWeight="bold">
                      Fields
                    </Text>
                    <Button size="sm" colorPalette="primary"
                      onClick={handleAddField}>
                      <Plus size={16} />
                      Add Field
                    </Button>
                  </HStack>

                  <VStack gap={4} align="stretch">
                    {fields.map((field, index) => (
                      <Box
                        key={field.id}
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                      >
                        <HStack gap={4} mb={3}>
                          <Field.Root required flex={1}>
                            <Field.Label>
                              Field Name <Field.RequiredIndicator />
                            </Field.Label>
                            <Input
                              value={field.name}
                              onChange={(e) =>
                                handleFieldChange(index, {
                                  name: e.target.value,
                                })
                              }
                              placeholder="e.g., customer_id"
                            />
                          </Field.Root>

                          <SelectField
                            label="Type"
                            value={field.type ? [field.type] : []}
                            onValueChange={(value) => {
                              console.log("SelectField onChange:", { index, value, typeof: typeof value });
                              // Handle both array and string values from SelectField
                              const typeValue = Array.isArray(value) ? value[0] : value;
                              console.log("Converted type value:", typeValue);
                              handleFieldChange(index, {
                                type: typeValue as SchemaField["type"],
                              });
                            }}
                            items={typeOptions}
                            contentRef={contentRef}
                          />

                          <IconButton
                            aria-label="Remove field"
                            size="sm"
                            colorPalette="red"
                            variant="ghost"
                            onClick={() => handleRemoveField(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </HStack>

                        <HStack gap={4}>
                          <Checkbox.Root
                            checked={field.primary_key}
                            onCheckedChange={(details) =>
                              handleFieldChange(index, {
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
                              handleFieldChange(index, {
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

                        {(() => {
                          console.log(`Field ${index} type check:`, {
                            type: field.type,
                            isEnum: field.type === "enum",
                            typeOf: typeof field.type
                          });
                          return field.type === "enum";
                        })() && (
                          <Box mt={3}>
                            <Text>Enum Values</Text>
                            <HStack mb={2}>
                              <Input
                                placeholder="Add enum value"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleAddEnumValue(
                                      index,
                                      (e.target as HTMLInputElement).value,
                                    );
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
                                    handleAddEnumValue(index, input.value);
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
                                    onClick={() =>
                                      handleRemoveEnumValue(index, value)
                                    }
                                  />
                                </Badge>
                              ))}
                            </Flex>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </VStack>
                </Box>

                <Separator />

                <Box>
                  <Text fontSize="lg" fontWeight="bold" mb={4}>
                    Indexes
                  </Text>

                  {(() => {
                    const availableFields = fields.filter(
                      (f) =>
                        f.name &&
                        f.name.trim() !== "" &&
                        !f.primary_key &&
                        !indexes.includes(f.name),
                    );

                    if (availableFields.length === 0) {
                      return (
                        <Text fontSize="sm" color="gray.500">
                          No fields available for indexing. Add field names
                          first.
                        </Text>
                      );
                    }

                    return (
                      <HStack mb={2}>
                        <Box flex={1}>
                          <SelectField
                            label=""
                            value={newIndex || ""}
                            onValueChange={(value) => {
                              setNewIndex(value || "");
                            }}
                            items={availableFields.map((field) => ({
                              value: field.name,
                              label: field.name,
                              description: field.name,
                            }))}
                            contentRef={contentRef}
                          />
                        </Box>
                        <Button onClick={handleAddIndex} disabled={!newIndex} mt={8}>
                          Add Index
                        </Button>
                      </HStack>
                    );
                  })()}

                  <Flex wrap="wrap" gap={2}>
                    {indexes.map((index) => (
                      <Badge
                        key={index}
                        colorPalette="green"
                        borderRadius="full"
                        px={3}
                        py={1}
                        display="flex"
                        alignItems="center"
                        gap={2}
                      >
                        {index}
                        <CloseButton
                          size="sm"
                          onClick={() => handleRemoveIndex(index)}
                        />
                      </Badge>
                    ))}
                  </Flex>
                </Box>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack gap={3}>
                {mode === "edit" && (
                  <Button
                    colorPalette="red"
                    variant="ghost"
                    onClick={handleDelete}
                  >
                    Delete Schema
                  </Button>
                )}
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button colorPalette="primary" onClick={handleSave}>
                  {mode === "create" ? "Create" : "Save"}
                </Button>
              </HStack>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
