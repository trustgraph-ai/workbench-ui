import React from "react";
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
  Wrap,
  Badge,
} from "@chakra-ui/react";
import { Plus, Trash2 } from "lucide-react";
import { useSchemas } from "../../state/schemas";
import { Schema, SchemaField } from "../../model/schemas-table";
import { validateSchema } from "../../utils/schema-validation";

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
  const [description, setDescription] = React.useState(initialSchema?.description || "");
  const [fields, setFields] = React.useState<SchemaField[]>(
    initialSchema?.fields || [
      {
        name: "",
        type: "string",
        primary_key: false,
        required: false,
      },
    ]
  );
  const [indexes, setIndexes] = React.useState<string[]>(initialSchema?.indexes || []);
  const [newIndex, setNewIndex] = React.useState("");
  const [errors, setErrors] = React.useState<string[]>([]);

  const handleAddField = () => {
    setFields([
      ...fields,
      {
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
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...field };
    
    // Clear enum values if type is not enum
    if (field.type && field.type !== "enum") {
      delete newFields[index].enum;
    }
    
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
    const validationErrors = validateSchema(schema, schemas, mode === "create" ? id : undefined);
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
            setFields([{ name: "", type: "string", primary_key: false, required: false }]);
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

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(x) => {
        if (!x.open) onClose();
      }}
      size="xl"
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxH="90vh" maxW="80vw" w="1200px">
            <Dialog.Header>
              <Dialog.Title>{mode === "create" ? "Create New Schema" : "Edit Schema"}</Dialog.Title>
            </Dialog.Header>
        
            <Dialog.Body overflowY="auto">
          <VStack spacing={6} align="stretch">
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
                <Field.Label>Schema ID <Field.RequiredIndicator /></Field.Label>
                <Input
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g., customer_records"
                />
              </Field.Root>
            )}

            <Field.Root required>
              <Field.Label>Name <Field.RequiredIndicator /></Field.Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Customer Records"
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label>Description <Field.RequiredIndicator /></Field.Label>
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
                <Button size="sm" leftIcon={<Plus size={16} />} onClick={handleAddField}>
                  Add Field
                </Button>
              </HStack>

              <VStack spacing={4} align="stretch">
                {fields.map((field, index) => (
                  <Box key={index} p={4} borderWidth="1px" borderRadius="md">
                    <HStack spacing={4} mb={3}>
                      <Field.Root required flex={1}>
                        <Field.Label>Field Name <Field.RequiredIndicator /></Field.Label>
                        <Input
                          value={field.name}
                          onChange={(e) => handleFieldChange(index, { name: e.target.value })}
                          placeholder="e.g., customer_id"
                        />
                      </Field.Root>

                      <Field.Root required flex={1}>
                        <Field.Label>Type <Field.RequiredIndicator /></Field.Label>
                        <Select
                          value={field.type}
                          onChange={(e) =>
                            handleFieldChange(index, {
                              type: e.target.value as SchemaField["type"],
                            })
                          }
                        >
                          <option value="string">String</option>
                          <option value="integer">Integer</option>
                          <option value="float">Float</option>
                          <option value="boolean">Boolean</option>
                          <option value="timestamp">Timestamp</option>
                          <option value="enum">Enum</option>
                        </Select>
                      </Field.Root>

                      <IconButton
                        aria-label="Remove field"
                        icon={<Trash2 size={16} />}
                        size="sm"
                        colorPalette="red"
                        variant="ghost"
                        onClick={() => handleRemoveField(index)}
                        isDisabled={fields.length === 1}
                      />
                    </HStack>

                    <HStack spacing={4}>
                      <Checkbox
                        isChecked={field.primary_key}
                        onChange={(e) =>
                          handleFieldChange(index, { primary_key: e.target.checked })
                        }
                      >
                        Primary Key
                      </Checkbox>

                      <Checkbox
                        isChecked={field.required}
                        onChange={(e) =>
                          handleFieldChange(index, { required: e.target.checked })
                        }
                      >
                        Required
                      </Checkbox>
                    </HStack>

                    {field.type === "enum" && (
                      <Box mt={3}>
                        <Field.Label>Enum Values</Field.Label>
                        <HStack mb={2}>
                          <Input
                            placeholder="Add enum value"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleAddEnumValue(index, (e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = "";
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              const input = document.querySelector(
                                `input[placeholder="Add enum value"]`
                              ) as HTMLInputElement;
                              if (input) {
                                handleAddEnumValue(index, input.value);
                                input.value = "";
                              }
                            }}
                          >
                            Add
                          </Button>
                        </HStack>
                        <Wrap>
                          {(field.enum || []).map((value) => (
                            <Badge
                              key={value}
                              colorPalette="blue"
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
                                onClick={() => handleRemoveEnumValue(index, value)}
                              />
                            </Badge>
                          ))}
                        </Wrap>
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
              <HStack mb={2}>
                <Select
                  placeholder="Select field to index"
                  value={newIndex}
                  onChange={(e) => setNewIndex(e.target.value)}
                >
                  {fields
                    .filter((f) => f.name && !f.primary_key && !indexes.includes(f.name))
                    .map((field) => (
                      <option key={field.name} value={field.name}>
                        {field.name}
                      </option>
                    ))}
                </Select>
                <Button onClick={handleAddIndex} isDisabled={!newIndex}>
                  Add Index
                </Button>
              </HStack>
              <Wrap>
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
              </Wrap>
            </Box>
          </VStack>
            </Dialog.Body>
            <Dialog.Footer>
          <HStack spacing={3}>
            {mode === "edit" && (
              <Button colorPalette="red" variant="ghost" onClick={handleDelete}>
                Delete Schema
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button colorPalette="blue" onClick={handleSave}>
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