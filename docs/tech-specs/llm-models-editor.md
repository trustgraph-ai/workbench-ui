# LLM Models Editor Technical Specification

## Overview

This specification describes the implementation of an LLM Models Editor in the TrustGraph UI. This feature allows administrators to manage the list of available LLM models that appear in dropdown menus when launching flows with LLM parameters.

LLM model lists are stored as parameter type definitions in the configuration system with type `"parameter-types"`. The editor provides a simple table interface for managing model options (ID, Description, Default) without requiring knowledge of the underlying JSON schema format.

## Background

LLM model parameters control which models are available when configuring flows. These are stored as parameter type definitions with an `enum` field containing model options.

### Current State

- LLM model lists can only be modified through direct config API calls or CLI commands
- Parameter types with `enum` arrays render as dropdowns in flow dialogs
- Parameter types without `enum` arrays render as text input fields

### Feature Switch

This feature is controlled by a feature switch in Settings:
- **Setting Name**: `llmModels`
- **Display Label**: "LLM Models"
- **Default**: `false` (off by default)
- **Location**: Settings page → Feature Switches section

## Goals

- **Simple Table Editor**: Editable table with ID, Description, and Default columns
- **Parameter Type Selection**: Dropdown to choose which parameter type to edit
- **In-Place Editing**: Click to edit model options directly in the table
- **Add/Delete Rows**: Add new models or delete existing ones
- **Default Selection**: Radio button to mark one model as default
- **Reordering**: Up/Down arrows to reorder models
- **Validation**: Prevent duplicate IDs and empty values
- **Auto-Save**: Save changes to config on every edit

## Technical Design

### Architecture

Following CODEBOT-INSTRUCTIONS.md patterns:

**Component Structure:**
```
src/
├── pages/
│   └── LLMModelsPage.tsx                    # Main page with PageHeader
├── components/
│   └── llm-models/                          # Domain-specific directory
│       ├── LLMModels.tsx                    # Container component
│       ├── ParameterTypeSelector.tsx        # Dropdown to select param type
│       └── ModelsTable.tsx                  # Editable table
├── state/
│   └── llm-models.ts                        # API hooks
└── model/
    └── llm-models.ts                        # TypeScript types
```

### Data Models

#### EnumOption (Model Option)

```typescript
interface EnumOption {
  id: string;           // Model ID (e.g., "gpt-4o")
  description: string;  // Display text (e.g., "GPT-4o (latest)")
}
```

#### LLMModelParameter

```typescript
interface LLMModelParameter {
  name: string;                // Parameter type key (e.g., "llm-model")
  type: string;                // Always "string"
  description: string;         // Read-only (e.g., "LLM model to use")
  default: string;             // Default model ID
  enum: EnumOption[];          // List of models
  required: boolean;           // Read-only
}
```

### UI Components

#### 1. LLMModelsPage (`src/pages/LLMModelsPage.tsx`)

```typescript
import { Bot } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import LLMModels from "../components/llm-models/LLMModels";

const LLMModelsPage = () => {
  return (
    <>
      <PageHeader
        icon={<Bot />}
        title="LLM Models"
        description="Manage available LLM models for flow parameters"
      />
      <LLMModels />
    </>
  );
};

export default LLMModelsPage;
```

#### 2. LLMModels Container (`src/components/llm-models/LLMModels.tsx`)

```typescript
import { useState } from "react";
import { Box, VStack, Alert, Text } from "@chakra-ui/react";
import { Info } from "lucide-react";
import ParameterTypeSelector from "./ParameterTypeSelector";
import ModelsTable from "./ModelsTable";
import { useLLMModels } from "../../state/llm-models";

const LLMModels = () => {
  const [selectedParamType, setSelectedParamType] = useState<string | null>(null);
  const { parameterTypes, isLoading } = useLLMModels();

  // Get the selected parameter type's data
  const currentParamType = parameterTypes.find(pt => pt.name === selectedParamType);

  // Auto-select first parameter type if none selected
  useEffect(() => {
    if (!selectedParamType && parameterTypes.length > 0) {
      setSelectedParamType(parameterTypes[0].name);
    }
  }, [parameterTypes, selectedParamType]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (parameterTypes.length === 0) {
    return (
      <Alert.Root status="info">
        <Alert.Indicator>
          <Info />
        </Alert.Indicator>
        <Alert.Content>
          <Alert.Title>No LLM Model Parameters Found</Alert.Title>
          <Alert.Description>
            No parameter types with model options (enum arrays) found in config.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  return (
    <VStack align="stretch" gap={6} p={6}>
      {/* Parameter Type Info */}
      <Box>
        <Text fontSize="sm" color="fg.muted" mb={2}>
          Parameter Type: {currentParamType?.description}
        </Text>
        <ParameterTypeSelector
          parameterTypes={parameterTypes}
          selectedType={selectedParamType}
          onSelectType={setSelectedParamType}
        />
      </Box>

      {/* Models Table */}
      {currentParamType && (
        <ModelsTable parameterType={currentParamType} />
      )}
    </VStack>
  );
};

export default LLMModels;
```

#### 3. ParameterTypeSelector (`src/components/llm-models/ParameterTypeSelector.tsx`)

```typescript
import SelectField from "../common/SelectField";
import SelectOptionText from "../common/SelectOptionText";

interface ParameterTypeSelectorProps {
  parameterTypes: LLMModelParameter[];
  selectedType: string | null;
  onSelectType: (type: string) => void;
}

const ParameterTypeSelector = ({
  parameterTypes,
  selectedType,
  onSelectType,
}: ParameterTypeSelectorProps) => {
  const options = parameterTypes.map(pt => ({
    value: pt.name,
    label: pt.name,
    description: (
      <SelectOptionText title={pt.name}>
        {pt.description}
      </SelectOptionText>
    ),
  }));

  return (
    <SelectField
      label="Select Parameter Type"
      items={options}
      value={selectedType ? [selectedType] : []}
      onValueChange={(values) => {
        if (values.length > 0) {
          onSelectType(values[0]);
        }
      }}
    />
  );
};

export default ParameterTypeSelector;
```

#### 4. ModelsTable (`src/components/llm-models/ModelsTable.tsx`)

Main editable table component:

```typescript
import { useState } from "react";
import {
  Table,
  Input,
  IconButton,
  Button,
  HStack,
  Box,
  Text,
  RadioGroup,
  RadioCard,
} from "@chakra-ui/react";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  Pencil,
} from "lucide-react";
import { useLLMModels } from "../../state/llm-models";

interface ModelsTableProps {
  parameterType: LLMModelParameter;
}

const ModelsTable = ({ parameterType }: ModelsTableProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editId, setEditId] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { updateParameter } = useLLMModels();

  const models = parameterType.enum || [];
  const defaultModel = parameterType.default;

  // Start editing a row
  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditId(models[index].id);
    setEditDescription(models[index].description);
  };

  // Save edit
  const saveEdit = () => {
    if (editingIndex === null) return;

    const newModels = [...models];
    newModels[editingIndex] = {
      id: editId.trim(),
      description: editDescription.trim(),
    };

    updateParameter({
      name: parameterType.name,
      enum: newModels,
      default: parameterType.default,
    });

    cancelEdit();
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingIndex(null);
    setEditId("");
    setEditDescription("");
  };

  // Add new model
  const addModel = () => {
    const newModels = [...models, { id: "", description: "" }];
    updateParameter({
      name: parameterType.name,
      enum: newModels,
      default: parameterType.default,
    });
    setEditingIndex(newModels.length - 1);
  };

  // Delete model
  const deleteModel = (index: number) => {
    const newModels = models.filter((_, i) => i !== index);

    // If deleting the default model, clear default
    const newDefault = models[index].id === defaultModel ? "" : defaultModel;

    updateParameter({
      name: parameterType.name,
      enum: newModels,
      default: newDefault,
    });
  };

  // Move model up
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newModels = [...models];
    [newModels[index - 1], newModels[index]] = [newModels[index], newModels[index - 1]];

    updateParameter({
      name: parameterType.name,
      enum: newModels,
      default: parameterType.default,
    });
  };

  // Move model down
  const moveDown = (index: number) => {
    if (index === models.length - 1) return;
    const newModels = [...models];
    [newModels[index], newModels[index + 1]] = [newModels[index + 1], newModels[index]];

    updateParameter({
      name: parameterType.name,
      enum: newModels,
      default: parameterType.default,
    });
  };

  // Set default model
  const setDefault = (modelId: string) => {
    updateParameter({
      name: parameterType.name,
      enum: models,
      default: modelId,
    });
  };

  if (models.length === 0) {
    return (
      <Box>
        <Text fontSize="sm" color="fg.muted" mb={4}>
          No models defined. Add your first model to enable dropdown mode.
        </Text>
        <Button size="sm" onClick={addModel}>
          <Plus /> Add First Model
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader width="60px">Default</Table.ColumnHeader>
            <Table.ColumnHeader>Model ID</Table.ColumnHeader>
            <Table.ColumnHeader>Description</Table.ColumnHeader>
            <Table.ColumnHeader width="200px">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {models.map((model, index) => (
            <Table.Row key={index}>
              {/* Default Radio Button */}
              <Table.Cell>
                <RadioGroup.Root
                  value={defaultModel}
                  onValueChange={(e) => setDefault(e.value)}
                >
                  <RadioCard.Item
                    value={model.id}
                    disabled={!model.id}
                    size="sm"
                  />
                </RadioGroup.Root>
              </Table.Cell>

              {/* Model ID (editable or display) */}
              <Table.Cell>
                {editingIndex === index ? (
                  <Input
                    size="sm"
                    value={editId}
                    onChange={(e) => setEditId(e.target.value)}
                    placeholder="e.g., gpt-4o"
                  />
                ) : (
                  <Text fontFamily="mono" fontSize="sm">
                    {model.id || <Text color="red.500">(empty)</Text>}
                  </Text>
                )}
              </Table.Cell>

              {/* Description (editable or display) */}
              <Table.Cell>
                {editingIndex === index ? (
                  <Input
                    size="sm"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="e.g., GPT-4o (latest)"
                  />
                ) : (
                  <Text fontSize="sm">
                    {model.description || <Text color="red.500">(empty)</Text>}
                  </Text>
                )}
              </Table.Cell>

              {/* Action Buttons */}
              <Table.Cell>
                <HStack gap={1}>
                  {editingIndex === index ? (
                    <>
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
                    </>
                  ) : (
                    <>
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
                        disabled={index === models.length - 1}
                      >
                        <ChevronDown />
                      </IconButton>
                      <IconButton
                        size="xs"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => deleteModel(index)}
                      >
                        <Trash2 />
                      </IconButton>
                    </>
                  )}
                </HStack>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Button size="sm" onClick={addModel} mt={4}>
        <Plus /> Add Model
      </Button>
    </Box>
  );
};

export default ModelsTable;
```

### State Management

#### useLLMModels Hook (`src/state/llm-models.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket, useConnectionState } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";
import { LLMModelParameter, EnumOption } from "../model/llm-models";

export const useLLMModels = () => {
  const socket = useSocket();
  const connectionState = useConnectionState();
  const queryClient = useQueryClient();
  const notify = useNotification();

  const isSocketReady =
    connectionState?.status === "authenticated" ||
    connectionState?.status === "unauthenticated";

  // Fetch all parameter types that have enum arrays (LLM model types)
  const paramTypesQuery = useQuery({
    queryKey: ["llm-models"],
    enabled: isSocketReady,
    queryFn: async () => {
      const response = await socket.config().getValues("parameter-types");

      // Filter to only parameter types with enum arrays
      const llmParams: LLMModelParameter[] = [];

      response.values?.forEach(item => {
        try {
          const paramDef = JSON.parse(item.value);

          // Only include if it has an enum array
          if (paramDef.enum && Array.isArray(paramDef.enum)) {
            llmParams.push({
              name: item.key,
              type: paramDef.type || "string",
              description: paramDef.description || item.key,
              default: paramDef.default || "",
              enum: paramDef.enum,
              required: paramDef.required || false,
            });
          }
        } catch (error) {
          console.error(`Failed to parse parameter type ${item.key}:`, error);
        }
      });

      return llmParams;
    },
  });

  // Update a parameter type's enum and default
  const updateMutation = useMutation({
    mutationFn: async ({
      name,
      enum: enumOptions,
      default: defaultValue,
    }: {
      name: string;
      enum: EnumOption[];
      default: string;
    }) => {
      // Get current parameter type to preserve other fields
      const currentParam = paramTypesQuery.data?.find(pt => pt.name === name);
      if (!currentParam) {
        throw new Error(`Parameter type ${name} not found`);
      }

      // Update only enum and default, preserve other fields
      const updatedDef = {
        type: currentParam.type,
        description: currentParam.description,
        required: currentParam.required,
        enum: enumOptions,
        default: defaultValue,
      };

      await socket.config().putConfig([{
        type: "parameter-types",
        key: name,
        value: JSON.stringify(updatedDef),
      }]);
    },
    onError: (err) => {
      notify.error(err.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-models"] });
      notify.success("Models updated successfully");
    },
  });

  useActivity(paramTypesQuery.isLoading, "Loading LLM models");
  useActivity(updateMutation.isPending, "Updating models");

  return {
    parameterTypes: paramTypesQuery.data || [],
    isLoading: paramTypesQuery.isLoading,
    isError: paramTypesQuery.isError,
    error: paramTypesQuery.error,

    updateParameter: updateMutation.mutate,
    isUpdating: updateMutation.isPending,

    refetch: paramTypesQuery.refetch,
  };
};
```

### Type Definitions

#### Model Types (`src/model/llm-models.ts`)

```typescript
export interface EnumOption {
  id: string;
  description: string;
}

export interface LLMModelParameter {
  name: string;
  type: string;
  description: string;
  default: string;
  enum: EnumOption[];
  required: boolean;
}
```

### Routing and Navigation

#### Add Route (`src/App.tsx`)

```typescript
{
  path: "/llm-models",
  element: <LLMModelsPage />,
}
```

#### Add Sidebar Navigation (`src/components/Sidebar.tsx`)

```typescript
import { Bot } from "lucide-react";

// In navigation items:
{
  to: "/llm-models",
  icon: Bot,
  label: "LLM Models",
  featureSwitch: "llmModels",
}
```

### Feature Switch Integration

#### Update Settings Types (`src/model/settings-types.ts`)

```typescript
export interface Settings {
  // ... existing fields ...
  featureSwitches: {
    // ... existing switches ...
    llmModels: boolean;
  };
}

export const DEFAULT_SETTINGS: Settings = {
  // ... existing defaults ...
  featureSwitches: {
    // ... existing switches ...
    llmModels: false, // Off by default
  },
};
```

#### Add to FeatureSwitchesSection (`src/components/settings/FeatureSwitchesSection.tsx`)

Add prop and handler for `llmModels`:

```typescript
<Checkbox
  checked={llmModels}
  onChange={(e) => onLlmModelsChange(e.target.checked)}
>
  LLM Models
</Checkbox>
<Field.HelperText>
  Enable LLM model list editor
</Field.HelperText>
```

## User Workflows

### Editing Model Options

1. Navigate to LLM Models page (visible if feature switch enabled)
2. Select parameter type from dropdown (e.g., "llm-model")
3. View current models in table
4. Click pencil icon to edit a model
5. Modify ID or Description
6. Click check mark to save
7. Changes auto-save to config

### Setting Default Model

1. View models table
2. Click radio button in "Default" column for desired model
3. Selection auto-saves

### Adding New Model

1. Click "Add Model" button
2. New empty row appears in edit mode
3. Enter Model ID and Description
4. Click check mark to save

### Deleting Model

1. Click trash icon next to model
2. Model is removed immediately
3. If deleted model was default, default is cleared

### Reordering Models

1. Use up/down arrows to move models
2. Order is preserved in dropdown display

## Validation Rules

1. **Model ID**: Required, must be unique within parameter type
2. **Description**: Required
3. **Default**: Must be an ID of an existing model (or empty)
4. **Duplicate Prevention**: Cannot save if ID already exists

## Implementation Checklist

- [ ] Update `src/model/settings-types.ts` - Add `llmModels` feature switch
- [ ] Update `src/components/settings/FeatureSwitchesSection.tsx` - Add LLM Models toggle
- [ ] Create `src/model/llm-models.ts` - Type definitions
- [ ] Create `src/state/llm-models.ts` - useLLMModels hook
- [ ] Create `src/components/llm-models/LLMModels.tsx` - Container
- [ ] Create `src/components/llm-models/ParameterTypeSelector.tsx` - Selector dropdown
- [ ] Create `src/components/llm-models/ModelsTable.tsx` - Editable table
- [ ] Create `src/pages/LLMModelsPage.tsx` - Main page
- [ ] Update `src/App.tsx` - Add route
- [ ] Update `src/components/Sidebar.tsx` - Add navigation item with feature switch
- [ ] Test CRUD operations
- [ ] Test validation
- [ ] Test feature switch toggle

## Future Enhancements

1. **Import/Export**: Bulk import/export model lists from JSON
2. **Templates**: Pre-configured model lists for common providers
3. **Usage Tracking**: Show which flows use each parameter type
4. **Bulk Edit**: Edit multiple parameter types at once
5. **Model Metadata**: Additional fields like context length, cost, etc.

## References

- Flow Configurable Parameters: `docs/tech-specs/flow-configurable-parameters.md`
- Parameter Inputs Component: `src/components/flows/ParameterInputs.tsx`
- Settings Feature Switches: `src/components/settings/FeatureSwitchesSection.tsx`
- CODEBOT Instructions: `CODEBOT-INSTRUCTIONS.md`
