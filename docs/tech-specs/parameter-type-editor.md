# LLM Models Editor Technical Specification

## Overview

This specification describes the implementation of an LLM Models Editor interface in the TrustGraph UI. This feature allows administrators to manage the list of available LLM models that appear in dropdown menus when launching flows with LLM parameters.

LLM model lists are stored as parameter type definitions in the configuration system with type `"parameter-types"` and key matching the parameter type name (e.g., `"llm-model"`). The editor provides a simple table interface for managing model options without requiring knowledge of the underlying JSON schema format.

## Background

LLM model parameters control which models are available when configuring flows. These are stored as parameter type definitions with an `enum` field containing model options.

Currently, LLM model lists can only be modified through direct config API calls or CLI commands. This feature adds a user-friendly UI specifically for managing LLM model options.

### Feature Switch

This feature is controlled by a feature switch in Settings:
- **Setting Name**: `llmModels`
- **Display Label**: "LLM Models"
- **Default**: `false` (off by default)
- **Location**: Settings page → Feature Switches section

### Key Behavior

The LLM Models editor manages the `enum` array within existing parameter type definitions. When the enum array is empty, parameters render as text input fields. When populated, they render as dropdowns.

**Example: OpenAI Models Parameter Type**
```json
{
  "type": "string",
  "description": "LLM model to use",
  "default": "gpt-4o",
  "enum": [
    {"id": "gpt-4o", "description": "GPT-4o (latest)"},
    {"id": "gpt-4o-mini", "description": "GPT-4o Mini"},
    {"id": "gpt-4-turbo", "description": "GPT-4 Turbo"},
    {"id": "gpt-4", "description": "GPT-4"}
  ],
  "required": true
}
```

The editor focuses on managing the `enum` array and `default` value - the root-level `description` and `required` fields are not editable through this UI.

## Goals

- **Simple Model Management**: Easy-to-use table for adding/removing LLM model options
- **Default Selection**: Mark one model as the default choice
- **Parameter Type Selection**: Choose which parameter type to edit (e.g., "llm-model", "llm-rag-model")
- **Reordering**: Drag or use up/down buttons to reorder model options
- **Validation**: Prevent duplicate model IDs and empty values
- **Feature Switch**: Enable/disable via Settings page
- **Read-Only Mode**: Non-editable fields (description, type, required) shown for context

## Technical Design

### Architecture

The parameter type editor follows the established pattern used for other configuration editors (Prompts, Agent Tools, Schemas, etc.):

1. **State Management Hook** (`useParameterTypes`)
   - Fetch all parameter types using `getValues("parameter-types")`
   - CRUD operations using `putConfig()` and `deleteConfig()`
   - React Query for caching and invalidation

2. **Component Structure**
   - `ParameterTypesPage.tsx` - Main page component with PageHeader
   - `components/parameter-types/ParameterTypes.tsx` - Container component
   - `components/parameter-types/ParameterTypesTable.tsx` - List view with selection
   - `components/parameter-types/ParameterTypeControls.tsx` - Action buttons (Create)
   - `components/parameter-types/EditParameterTypeDialog.tsx` - Create/Edit dialog
   - `components/parameter-types/EnumOptionsEditor.tsx` - Table editor for enum options
   - `state/parameter-types.ts` - React Query hooks
   - `model/parameter-types-table.tsx` - TypeScript definitions and table columns

### Data Models

#### ParameterTypeDefinition

```typescript
interface EnumOption {
  id: string;           // Value used in backend
  description: string;  // Display text shown to users
}

interface ParameterTypeDefinition {
  name: string;          // Unique identifier (e.g., "llm-model", "temperature")
  type: "string" | "number" | "integer" | "boolean";
  description: string;   // Description shown in UI
  default?: any;         // Default value
  enum?: EnumOption[];   // Optional: for dropdown mode
  minimum?: number;      // For numeric types
  maximum?: number;      // For numeric types
  pattern?: string;      // For string validation (regex)
  required?: boolean;    // Whether parameter is required
  helper?: string;       // Helper text shown in UI
  placeholder?: string;  // Placeholder text for inputs
}
```

#### Config Storage Format

Parameter types are stored in config with:
- `type`: `"parameter-types"`
- `key`: The parameter type name (e.g., `"llm-model"`)
- `value`: JSON-stringified `ParameterTypeDefinition` (without the `name` field)

### UI Components

#### 1. ParameterTypesPage (`src/pages/ParameterTypesPage.tsx`)

Main page component:
```typescript
const ParameterTypesPage = () => {
  return (
    <>
      <PageHeader
        icon={<Settings />}
        title="Parameter Types"
        description="Manage parameter type definitions for flow configuration"
      />
      <ParameterTypes />
    </>
  );
};
```

#### 2. ParameterTypes Container (`src/components/parameter-types/ParameterTypes.tsx`)

Orchestrates the table, actions, and dialog:
```typescript
const ParameterTypes = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParamType, setEditingParamType] = useState(null);

  const paramTypesState = useParameterTypes();
  const table = useReactTable({...});

  // Handlers for create, edit, delete
  const onCreateNew = () => { ... };
  const onEdit = () => { ... };
  const onDelete = () => { ... };

  return (
    <>
      <ParameterTypeActions
        selectedCount={selected.length}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <EditParameterTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={onSave}
        editingParamType={editingParamType}
      />
      <SelectableTable table={table} />
      <ParameterTypeControls onCreate={onCreateNew} />
    </>
  );
};
```

#### 3. ParameterTypesTable (`src/model/parameter-types-table.tsx`)

Table column definitions:
```typescript
export const columns = [
  // Selection checkbox
  columnHelper.display({ id: "select", ... }),

  // Name (unique identifier)
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
  }),

  // Type (string, number, integer, boolean)
  columnHelper.accessor("type", {
    header: "Type",
    cell: (info) => <Badge>{info.getValue()}</Badge>,
  }),

  // Description
  columnHelper.accessor("description", {
    header: "Description",
    cell: (info) => info.getValue(),
  }),

  // Input Mode (Text Input / Dropdown)
  columnHelper.display({
    id: "inputMode",
    header: "Input Mode",
    cell: ({ row }) => {
      const hasEnum = row.original.enum && row.original.enum.length > 0;
      return (
        <Badge colorPalette={hasEnum ? "blue" : "gray"}>
          {hasEnum ? "Dropdown" : "Text Input"}
        </Badge>
      );
    },
  }),

  // Options Count (for enum types)
  columnHelper.display({
    id: "optionsCount",
    header: "Options",
    cell: ({ row }) => {
      const count = row.original.enum?.length || 0;
      return count > 0 ? count : "-";
    },
  }),

  // Default Value
  columnHelper.accessor("default", {
    header: "Default",
    cell: (info) => {
      const value = info.getValue();
      return value !== undefined ? String(value) : "-";
    },
  }),
];
```

#### 4. EditParameterTypeDialog (`src/components/parameter-types/EditParameterTypeDialog.tsx`)

Main dialog for creating/editing parameter types:

```typescript
const EditParameterTypeDialog = ({
  open,
  onOpenChange,
  onSave,
  editingParamType,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("string");
  const [description, setDescription] = useState("");
  const [defaultValue, setDefaultValue] = useState("");
  const [required, setRequired] = useState(false);
  const [helper, setHelper] = useState("");
  const [placeholder, setPlaceholder] = useState("");

  // Numeric constraints
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");

  // String constraints
  const [pattern, setPattern] = useState("");

  // Enum options (determines text input vs dropdown mode)
  const [enumOptions, setEnumOptions] = useState<EnumOption[]>([]);

  // Reset form when dialog opens/closes
  useEffect(() => { ... }, [editingParamType, open]);

  const handleSubmit = () => {
    const paramTypeDef: ParameterTypeDefinition = {
      name,
      type,
      description,
      default: defaultValue,
      required,
      helper,
      placeholder,
    };

    // Add numeric constraints if applicable
    if (type === "number" || type === "integer") {
      if (minimum) paramTypeDef.minimum = parseFloat(minimum);
      if (maximum) paramTypeDef.maximum = parseFloat(maximum);
    }

    // Add pattern for string validation
    if (type === "string" && pattern) {
      paramTypeDef.pattern = pattern;
    }

    // Add enum only if options exist (determines input mode)
    if (enumOptions.length > 0) {
      paramTypeDef.enum = enumOptions;
    }

    onSave(paramTypeDef);
  };

  const isValid = name.trim() !== "" && description.trim() !== "";

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {editingParamType ? "Edit Parameter Type" : "Create Parameter Type"}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              {/* Basic Fields */}
              <TextField
                label="Name"
                value={name}
                onValueChange={setName}
                disabled={!!editingParamType}
                required
                helperText="Unique identifier (e.g., 'llm-model', 'temperature')"
              />

              <SelectField
                label="Type"
                items={[
                  {value: "string", label: "String"},
                  {value: "number", label: "Number"},
                  {value: "integer", label: "Integer"},
                  {value: "boolean", label: "Boolean"},
                ]}
                value={[type]}
                onValueChange={(values) => setType(values[0])}
              />

              <TextField
                label="Description"
                value={description}
                onValueChange={setDescription}
                required
                helperText="Shown as label in parameter forms"
              />

              <TextField
                label="Default Value"
                value={defaultValue}
                onValueChange={setDefaultValue}
                helperText="Default value if user doesn't provide one"
              />

              <Checkbox
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
              >
                Required
              </Checkbox>

              <TextAreaField
                label="Helper Text"
                value={helper}
                onValueChange={setHelper}
                helperText="Help text shown below the input field"
              />

              <TextField
                label="Placeholder"
                value={placeholder}
                onValueChange={setPlaceholder}
                helperText="Placeholder text shown in empty input fields"
              />

              {/* Type-specific fields */}
              {(type === "number" || type === "integer") && (
                <>
                  <TextField
                    label="Minimum Value"
                    type="number"
                    value={minimum}
                    onValueChange={setMinimum}
                  />
                  <TextField
                    label="Maximum Value"
                    type="number"
                    value={maximum}
                    onValueChange={setMaximum}
                  />
                </>
              )}

              {type === "string" && (
                <TextField
                  label="Validation Pattern (Regex)"
                  value={pattern}
                  onValueChange={setPattern}
                  helperText="Regular expression for validation (optional)"
                />
              )}

              {/* Enum Options Editor - determines input mode */}
              <Box mt={5}>
                <Text fontWeight="bold" mb={2}>
                  Options (Empty = Text Input, Populated = Dropdown)
                </Text>
                <EnumOptionsEditor
                  options={enumOptions}
                  onOptionsChange={setEnumOptions}
                />
              </Box>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <ProgressSubmitButton onClick={handleSubmit} disabled={!isValid}>
                {editingParamType ? "Update" : "Create"}
              </ProgressSubmitButton>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
```

#### 5. EnumOptionsEditor (`src/components/parameter-types/EnumOptionsEditor.tsx`)

Table editor for managing enum options:

```typescript
interface EnumOptionsEditorProps {
  options: EnumOption[];
  onOptionsChange: (options: EnumOption[]) => void;
}

const EnumOptionsEditor = ({ options, onOptionsChange }) => {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editId, setEditId] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const startEdit = (index: number) => {
    setEditIndex(index);
    setEditId(options[index].id);
    setEditDescription(options[index].description);
  };

  const saveEdit = () => {
    if (editIndex !== null) {
      const newOptions = [...options];
      newOptions[editIndex] = {
        id: editId.trim(),
        description: editDescription.trim(),
      };
      onOptionsChange(newOptions);
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditId("");
    setEditDescription("");
  };

  const addOption = () => {
    onOptionsChange([...options, { id: "", description: "" }]);
    setEditIndex(options.length);
  };

  const deleteOption = (index: number) => {
    onOptionsChange(options.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOptions = [...options];
    [newOptions[index - 1], newOptions[index]] =
      [newOptions[index], newOptions[index - 1]];
    onOptionsChange(newOptions);
  };

  const moveDown = (index: number) => {
    if (index === options.length - 1) return;
    const newOptions = [...options];
    [newOptions[index], newOptions[index + 1]] =
      [newOptions[index + 1], newOptions[index]];
    onOptionsChange(newOptions);
  };

  if (options.length === 0) {
    return (
      <Box>
        <Text fontSize="sm" color="fg.muted" mb={3}>
          No options defined. Parameter will render as text input.
        </Text>
        <Button size="sm" onClick={addOption}>
          <Plus /> Add First Option
        </Button>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={2}>
      <Text fontSize="sm" color="fg.muted">
        Options defined. Parameter will render as dropdown.
      </Text>

      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Value (ID)</Table.ColumnHeader>
            <Table.ColumnHeader>Description</Table.ColumnHeader>
            <Table.ColumnHeader width="140px">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {options.map((option, index) => (
            <Table.Row key={index}>
              {editIndex === index ? (
                <>
                  <Table.Cell>
                    <Input
                      size="sm"
                      value={editId}
                      onChange={(e) => setEditId(e.target.value)}
                      placeholder="e.g., gpt-4o"
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      size="sm"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="e.g., GPT-4o (latest)"
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <HStack gap={1}>
                      <IconButton
                        size="xs"
                        variant="ghost"
                        onClick={saveEdit}
                        disabled={!editId.trim() || !editDescription.trim()}
                      >
                        <Check />
                      </IconButton>
                      <IconButton
                        size="xs"
                        variant="ghost"
                        onClick={cancelEdit}
                      >
                        <X />
                      </IconButton>
                    </HStack>
                  </Table.Cell>
                </>
              ) : (
                <>
                  <Table.Cell>
                    <Code fontSize="sm">{option.id}</Code>
                  </Table.Cell>
                  <Table.Cell>{option.description}</Table.Cell>
                  <Table.Cell>
                    <HStack gap={1}>
                      <IconButton
                        size="xs"
                        variant="ghost"
                        onClick={() => startEdit(index)}
                      >
                        <Pencil />
                      </IconButton>
                      <IconButton
                        size="xs"
                        variant="ghost"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                      >
                        <ChevronUp />
                      </IconButton>
                      <IconButton
                        size="xs"
                        variant="ghost"
                        onClick={() => moveDown(index)}
                        disabled={index === options.length - 1}
                      >
                        <ChevronDown />
                      </IconButton>
                      <IconButton
                        size="xs"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => deleteOption(index)}
                      >
                        <Trash2 />
                      </IconButton>
                    </HStack>
                  </Table.Cell>
                </>
              )}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Button size="sm" onClick={addOption}>
        <Plus /> Add Option
      </Button>
    </VStack>
  );
};
```

### State Management

#### useParameterTypes Hook (`src/state/parameter-types.ts`)

```typescript
export const useParameterTypes = () => {
  const socket = useSocket();
  const connectionState = useConnectionState();
  const queryClient = useQueryClient();
  const notify = useNotification();

  const isSocketReady =
    connectionState?.status === "authenticated" ||
    connectionState?.status === "unauthenticated";

  // Query for fetching all parameter types
  const paramTypesQuery = useQuery({
    queryKey: ["parameter-types"],
    enabled: isSocketReady,
    queryFn: async () => {
      const response = await socket.config().getValues("parameter-types");

      // Transform config response to ParameterTypeDefinition array
      return response.values?.map(item => ({
        name: item.key,
        ...JSON.parse(item.value),
      })) || [];
    },
  });

  // Mutation for saving parameter type
  const saveParamTypeMutation = useMutation({
    mutationFn: async ({ paramType, onSuccess }) => {
      const { name, ...definition } = paramType;

      await socket.config().putConfig([{
        type: "parameter-types",
        key: name,
        value: JSON.stringify(definition),
      }]);

      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      notify.error(err.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parameter-types"] });
      notify.success("Parameter type saved successfully");
    },
  });

  // Mutation for deleting parameter types
  const deleteParamTypesMutation = useMutation({
    mutationFn: async ({ names, onSuccess }) => {
      const keys = names.map(name => ({
        type: "parameter-types",
        key: name,
      }));

      await socket.config().deleteConfig(keys);

      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      notify.error(err.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parameter-types"] });
      notify.success("Parameter types deleted successfully");
    },
  });

  useActivity(paramTypesQuery.isLoading, "Loading parameter types");
  useActivity(saveParamTypeMutation.isPending, "Saving parameter type");
  useActivity(deleteParamTypesMutation.isPending, "Deleting parameter types");

  return {
    parameterTypes: paramTypesQuery.data || [],
    isLoading: paramTypesQuery.isLoading,
    isError: paramTypesQuery.isError,
    error: paramTypesQuery.error,

    saveParameterType: saveParamTypeMutation.mutate,
    isSaving: saveParamTypeMutation.isPending,

    deleteParameterTypes: deleteParamTypesMutation.mutate,
    isDeleting: deleteParamTypesMutation.isPending,

    refetch: paramTypesQuery.refetch,
  };
};
```

### Routing

Add route to `src/App.tsx`:

```typescript
{
  path: "/parameter-types",
  element: <ParameterTypesPage />,
}
```

Add navigation item to `src/components/Sidebar.tsx`:

```typescript
{
  to: "/parameter-types",
  icon: Sliders,
  label: "Parameter Types",
  featureSwitch: "parameterTypes", // Optional: add feature switch
}
```

## Validation Rules

1. **Name Validation**:
   - Required
   - Must be unique across all parameter types
   - Cannot be changed after creation (acts as ID)
   - Valid characters: lowercase letters, numbers, hyphens

2. **Description Validation**:
   - Required
   - Used as display label in UI

3. **Type Validation**:
   - Must be one of: string, number, integer, boolean

4. **Enum Options Validation**:
   - Each option must have both `id` and `description`
   - IDs must be unique within the enum
   - If enum is empty, parameter renders as text input
   - If enum has entries, parameter renders as dropdown

5. **Numeric Constraints**:
   - Minimum must be less than maximum (if both specified)
   - Only applicable for number/integer types

6. **Default Value Validation**:
   - Must match the parameter type
   - If enum is specified, default must be one of the enum IDs

## User Workflows

### Creating a Dropdown Parameter Type

1. Click "Create Parameter Type"
2. Enter name (e.g., "llm-model")
3. Select type "string"
4. Enter description "LLM model to use"
5. In Enum Options table, click "Add First Option"
6. Enter ID: "gpt-4o", Description: "GPT-4o (latest)"
7. Add more options as needed
8. Set default value to one of the option IDs
9. Click "Create"
10. **Result**: Parameter will render as dropdown in flow dialogs

### Creating a Text Input Parameter Type

1. Click "Create Parameter Type"
2. Enter name (e.g., "azure-model")
3. Select type "string"
4. Enter description "Azure OpenAI model name"
5. Set default value (e.g., "gpt-4o")
6. **Leave enum options table empty**
7. Optionally add validation pattern
8. Click "Create"
9. **Result**: Parameter will render as text input in flow dialogs

### Converting Between Modes

**Text Input → Dropdown**:
- Edit the parameter type
- Add options to the enum table
- Save changes

**Dropdown → Text Input**:
- Edit the parameter type
- Delete all options from enum table
- Save changes

## Implementation Checklist

- [ ] Create `src/state/parameter-types.ts` with useParameterTypes hook
- [ ] Create `src/model/parameter-types-table.tsx` with column definitions
- [ ] Create `src/components/parameter-types/ParameterTypes.tsx` container
- [ ] Create `src/components/parameter-types/ParameterTypesTable.tsx` (uses SelectableTable)
- [ ] Create `src/components/parameter-types/ParameterTypeActions.tsx` action bar
- [ ] Create `src/components/parameter-types/ParameterTypeControls.tsx` create button
- [ ] Create `src/components/parameter-types/EditParameterTypeDialog.tsx` main dialog
- [ ] Create `src/components/parameter-types/EnumOptionsEditor.tsx` table editor
- [ ] Create `src/pages/ParameterTypesPage.tsx` page component
- [ ] Add routing in App.tsx
- [ ] Add sidebar navigation item
- [ ] Add feature switch (optional)
- [ ] Write unit tests for validation logic
- [ ] Write integration tests for CRUD operations
- [ ] Update documentation

## Future Enhancements

1. **Parameter Type Templates**: Pre-configured templates for common parameter types
2. **Import/Export**: Bulk import/export of parameter type definitions
3. **Usage Tracking**: Show which flow classes use each parameter type
4. **Validation Testing**: Test parameter validation rules in the editor
5. **Parameter Type Cloning**: Duplicate existing parameter types as starting point
6. **Bulk Operations**: Edit multiple parameter types at once

## References

- Prompts Editor: `src/components/prompts/` - Similar CRUD pattern
- Agent Tools Editor: `src/components/agent-tools/` - Similar config management
- Flow Parameters Spec: `docs/tech-specs/flow-configurable-parameters.md`
- Parameter Input Component: `src/components/flows/ParameterInputs.tsx`
