# Flow Class Visual Editor Technical Specification

## Overview

A React-based visual editor for creating and modifying TrustGraph flow class definitions using a node-and-edge graph interface. Built with React Flow, this component allows users to visually design dataflow patterns by dragging processors onto a canvas and connecting them with queues.

## Core Technologies

- **React Flow** - Node-based editor framework
- **TypeScript** - Type safety for flow definitions
- **Chakra UI v3** - UI components and theming
- **Zustand** - Editor state management
- **Zod** - Schema validation for flow class structure

## Component Architecture

### Directory Structure
```
src/components/flow-editor/
├── FlowClassEditor.tsx           # Main editor component
├── nodes/                         # Custom node components
│   ├── ClassProcessorNode.tsx    # Shared service nodes
│   ├── FlowProcessorNode.tsx     # Flow-specific nodes
│   └── InterfaceNode.tsx         # Entry/exit point nodes
├── edges/                         # Custom edge components
│   ├── PersistentQueueEdge.tsx   # Persistent queue connections
│   └── RequestResponseEdge.tsx   # Request/response pairs
├── panels/                        # Editor UI panels
│   ├── NodePalette.tsx           # Drag-and-drop processor library
│   ├── PropertiesPanel.tsx       # Node/edge configuration
│   └── ValidationPanel.tsx       # Real-time validation feedback
├── hooks/
│   ├── useFlowValidation.ts      # Validation logic
│   ├── useFlowExport.ts          # JSON export/import
│   └── useAutoLayout.ts          # Automatic graph layout
└── types/
    └── flowEditorTypes.ts        # TypeScript definitions
```

## Visual Design

### Node Types

#### 1. Class Processor Node ({class})
```tsx
{
  type: 'classProcessor',
  data: {
    processorName: string,      // e.g., "embeddings"
    queues: {
      request?: string,          // Queue pattern
      response?: string,         // Queue pattern
      [key: string]: string      // Additional queues
    }
  },
  style: {
    background: 'accent.subtle', // Shared service color
    border: '2px solid accent.solid',
    icon: <Share2 />            // Lucide icon indicating shared
  }
}
```

#### 2. Flow Processor Node ({id})
```tsx
{
  type: 'flowProcessor',
  data: {
    processorName: string,       // e.g., "chunker"
    queues: {
      input?: string,            // Input queue
      output?: string,           // Output queue
      [key: string]: string      // Additional queues
    }
  },
  style: {
    background: 'primary.subtle', // Flow-specific color
    border: '2px solid primary.solid',
    icon: <Box />                // Lucide icon for isolated
  }
}
```

#### 3. Interface Node
```tsx
{
  type: 'interfaceNode',
  data: {
    interfaceName: string,       // e.g., "document-load"
    interfaceType: 'fire-and-forget' | 'request-response',
    queuePattern?: string,       // For fire-and-forget
    request?: string,            // For request-response
    response?: string            // For request-response
  },
  style: {
    background: 'bg.muted',
    border: '2px dashed border.muted',
    icon: <Plug />               // Entry/exit point indicator
  }
}
```

### Edge Types

#### 1. Persistent Queue Edge
- **Visual**: Solid line with arrow
- **Color**: Based on namespace (flow: green, request: blue, response: purple)
- **Label**: Queue name displayed on hover
- **Validation**: Source/target compatibility checking

#### 2. Non-Persistent Queue Edge  
- **Visual**: Dashed line with arrow
- **Color**: Lighter variant of namespace colors
- **Label**: Queue name with non-persistent indicator
- **Validation**: Request/response pairing validation

## User Interactions

### Node Palette
- **Categorized processor library**:
  - Common Services (class processors)
  - Flow Components (flow processors)
  - Interfaces (entry/exit points)
- **Drag-and-drop** to add nodes to canvas
- **Search/filter** functionality
- **Templates** for common patterns (RAG, document processing)

### Canvas Operations
- **Pan and zoom** with mouse/trackpad
- **Node selection** (single/multi-select)
- **Connection creation** by dragging from handles
- **Node deletion** with Delete key or context menu
- **Edge deletion** by clicking and pressing Delete
- **Undo/redo** support (Cmd+Z/Cmd+Shift+Z)

### Properties Panel
Dynamic panel that shows configuration for selected node/edge:

#### For Processors:
- Processor name (editable)
- Template variable type ({class} or {id})
- Queue configurations:
  - Add/remove queues
  - Edit queue names
  - Set persistence mode
  - Configure namespace

#### For Edges:
- Queue pattern display
- Persistence mode toggle
- Namespace selection
- Custom topic name

### Validation Panel
Real-time feedback on flow validity:
- **Missing connections** warnings
- **Invalid queue patterns** errors
- **Orphaned nodes** detection
- **Circular dependency** checking
- **Template variable consistency**

## Core Features

### 1. Auto-Layout
```tsx
const handleAutoLayout = () => {
  const layoutedElements = getLayoutedElements(nodes, edges, {
    direction: 'LR',  // Left to right
    nodeSpacing: 150,
    levelSpacing: 200,
    animate: true
  });
  setNodes(layoutedElements.nodes);
  setEdges(layoutedElements.edges);
};
```

### 2. Import/Export
```tsx
// Export to flow class JSON
const exportFlowClass = () => {
  const flowClass = {
    class: extractClassProcessors(nodes),
    flow: extractFlowProcessors(nodes),
    interfaces: extractInterfaces(nodes),
    description: metadata.description,
    tags: metadata.tags
  };
  return JSON.stringify(flowClass, null, 2);
};

// Import from JSON
const importFlowClass = (json: string) => {
  const flowClass = JSON.parse(json);
  const { nodes, edges } = convertToReactFlow(flowClass);
  setNodes(nodes);
  setEdges(edges);
};
```

### 3. Connection Validation
```tsx
const isValidConnection = (connection: Connection) => {
  const sourceNode = getNode(connection.source);
  const targetNode = getNode(connection.target);
  
  // Validate queue compatibility
  if (!areQueuesCompatible(sourceNode, targetNode)) {
    return false;
  }
  
  // Prevent circular dependencies
  if (createsCircularDependency(connection)) {
    return false;
  }
  
  return true;
};
```

### 4. Smart Templates
Pre-built flow patterns users can instantiate:
- **Document RAG Pipeline**: PDF → Chunker → Embeddings → Storage
- **Graph RAG Pipeline**: Knowledge extraction → Graph embeddings → Query
- **Simple Q&A**: Prompt → LLM → Response
- **Custom Template**: User-defined reusable patterns

## State Management

```tsx
interface FlowEditorState {
  // React Flow state
  nodes: Node[];
  edges: Edge[];
  
  // Editor state
  selectedElement: Node | Edge | null;
  validationErrors: ValidationError[];
  isDirty: boolean;
  
  // Metadata
  flowClassName: string;
  description: string;
  tags: string[];
  
  // Actions
  addNode: (type: NodeType, position: XYPosition) => void;
  updateNode: (nodeId: string, data: NodeData) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (edge: Edge) => void;
  deleteEdge: (edgeId: string) => void;
  validateFlow: () => ValidationResult;
  exportFlow: () => FlowClassDefinition;
  importFlow: (definition: FlowClassDefinition) => void;
}
```

## Visual Indicators

### Node States
- **Normal**: Default appearance
- **Selected**: Blue glow/border
- **Invalid**: Red border with error icon
- **Connecting**: Pulse animation on handles
- **Hover**: Slight scale increase

### Edge States
- **Normal**: Default appearance  
- **Selected**: Highlighted with thicker stroke
- **Invalid**: Red dashed line
- **Animated**: Flow animation for active connections

### Queue Handle Types
- **Input**: Left side of node, inward arrow
- **Output**: Right side of node, outward arrow
- **Bidirectional**: Both sides, for request/response

## Keyboard Shortcuts

- `Delete` - Delete selected elements
- `Cmd+Z` - Undo
- `Cmd+Shift+Z` - Redo
- `Cmd+S` - Save flow class
- `Cmd+O` - Open flow class
- `Cmd+E` - Export to JSON
- `Space` - Pan mode
- `Cmd+A` - Select all nodes
- `Cmd+D` - Duplicate selected nodes

## Integration Points

### Config API Integration

The flow class editor uses the existing Config API for all flow class operations:

#### State Management Hook
```tsx
// src/state/flow-classes.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./socket";

export const useFlowClasses = () => {
  const socket = useSocket();
  
  return useQuery({
    queryKey: ["flow-classes"],
    queryFn: async () => {
      const response = await socket.request({
        operation: "get-config",
        path: "flow-classes"
      });
      return response.configuration as FlowClassDefinition[];
    }
  });
};

export const useFlowClass = (flowClassId: string) => {
  const socket = useSocket();
  
  return useQuery({
    queryKey: ["flow-class", flowClassId],
    queryFn: async () => {
      const response = await socket.request({
        operation: "get-config",
        path: `flow-classes/${flowClassId}`
      });
      return response.configuration as FlowClassDefinition;
    }
  });
};

export const useUpdateFlowClass = () => {
  const socket = useSocket();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, flowClass }: { 
      id: string; 
      flowClass: FlowClassDefinition 
    }) => {
      return await socket.request({
        operation: "set-config",
        path: `flow-classes/${id}`,
        configuration: flowClass
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["flow-class", variables.id]);
      queryClient.invalidateQueries(["flow-classes"]);
    }
  });
};

export const useDeleteFlowClass = () => {
  const socket = useSocket();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return await socket.request({
        operation: "delete-config",
        path: `flow-classes/${id}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["flow-classes"]);
    }
  });
};
```

#### Editor Component Integration
```tsx
// src/components/flow-editor/FlowClassEditor.tsx
import { useFlowClass, useUpdateFlowClass } from "../../state/flow-classes";
import { useActivity } from "../../state/activity";
import { useNotification } from "../../state/notify";

export const FlowClassEditor = ({ flowClassId }: { flowClassId?: string }) => {
  const notify = useNotification();
  
  // Load existing flow class if ID provided
  const { data: flowClass, isLoading } = useFlowClass(flowClassId);
  const updateMutation = useUpdateFlowClass();
  
  // Track loading state
  useActivity(isLoading, "Loading flow class");
  useActivity(updateMutation.isPending, "Saving flow class");
  
  // Initialize React Flow with loaded data
  useEffect(() => {
    if (flowClass) {
      const { nodes, edges } = convertFlowClassToReactFlow(flowClass);
      setNodes(nodes);
      setEdges(edges);
      setMetadata({
        description: flowClass.description,
        tags: flowClass.tags
      });
    }
  }, [flowClass]);
  
  // Save handler
  const handleSave = async () => {
    const flowClassData = exportFlowClass();
    
    try {
      await updateMutation.mutateAsync({
        id: flowClassId || generateFlowClassId(),
        flowClass: flowClassData
      });
      notify.success("Flow class saved successfully");
    } catch (error) {
      notify.error("Failed to save flow class");
    }
  };
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      // ... rest of React Flow config
    />
  );
};
```

#### Flow Class List Integration
```tsx
// src/components/flow-editor/FlowClassList.tsx
import { useFlowClasses, useDeleteFlowClass } from "../../state/flow-classes";

export const FlowClassList = () => {
  const { data: flowClasses, isLoading } = useFlowClasses();
  const deleteMutation = useDeleteFlowClass();
  
  useActivity(isLoading, "Loading flow classes");
  useActivity(deleteMutation.isPending, "Deleting flow class");
  
  return (
    <VStack>
      {flowClasses?.map(flowClass => (
        <Card key={flowClass.id}>
          <HStack>
            <Text>{flowClass.description}</Text>
            <Button onClick={() => openEditor(flowClass.id)}>
              Edit
            </Button>
            <Button onClick={() => deleteMutation.mutate(flowClass.id)}>
              Delete
            </Button>
          </HStack>
        </Card>
      ))}
    </VStack>
  );
};
```

#### Config API Request/Response Format
```typescript
// Request to get all flow classes
{
  operation: "get-config",
  path: "flow-classes"
}

// Response
{
  configuration: [
    {
      id: "document-rag-flow",
      class: { /* class processors */ },
      flow: { /* flow processors */ },
      interfaces: { /* interfaces */ },
      description: "Document RAG pipeline",
      tags: ["rag", "documents"]
    }
  ]
}

// Request to update flow class
{
  operation: "set-config",
  path: "flow-classes/document-rag-flow",
  configuration: {
    class: { /* updated class processors */ },
    flow: { /* updated flow processors */ },
    interfaces: { /* updated interfaces */ },
    description: "Updated description",
    tags: ["rag", "documents", "v2"]
  }
}
```

### Real-time Updates via WebSocket

The editor subscribes to configuration changes to handle external updates:

```tsx
useEffect(() => {
  const subscription = socket.subscribe(
    `config/flow-classes/${flowClassId}`,
    (update) => {
      // Handle external updates to the flow class
      if (update.source !== currentSessionId) {
        notify.warning("Flow class updated externally. Refreshing...");
        queryClient.invalidateQueries(["flow-class", flowClassId]);
      }
    }
  );
  
  return () => subscription.unsubscribe();
}, [flowClassId]);
```

### With Existing UI
- Embedded in workbench as new tab/page
- Uses consistent Chakra UI theming
- Integrates with notification system
- Progress indicators via `useActivity`
- Follows existing Config API patterns

## Responsive Design

### Desktop (Primary)
- Full editor with all panels visible
- Optimal canvas size for complex flows
- Properties panel as sidebar

### Tablet
- Collapsible panels to maximize canvas
- Touch-friendly node manipulation
- Simplified toolbar

### Mobile (View-only)
- Read-only flow visualization
- Pan and zoom only
- Export functionality retained

## Performance Considerations

### Optimizations
- **Virtualization** for large flows (100+ nodes)
- **Debounced validation** during editing
- **Memoized node/edge components**
- **Lazy loading** of processor templates
- **Web Workers** for layout calculations

### Limits
- Max 500 nodes per flow class
- Max 1000 edges per flow class
- Auto-layout for flows under 100 nodes
- Real-time validation for flows under 50 nodes

## Error Handling

### Validation Errors
- Inline error indicators on invalid nodes/edges
- Validation panel with detailed error list
- Prevent export/save when errors exist

### Runtime Errors
- Connection rejection with toast notification
- Import failure with detailed parsing errors
- Auto-save recovery for browser crashes

## Future Enhancements

### Phase 2
- **Processor library management** - Add custom processors
- **Collaborative editing** - Real-time multi-user support
- **Version control** - Flow class versioning and diff view
- **Simulation mode** - Visualize data flow through the graph

### Phase 3
- **AI assistance** - Suggest connections and optimizations
- **Performance profiling** - Visualize bottlenecks
- **Template marketplace** - Share flow patterns
- **Code generation** - Generate processor stubs from flow

## Testing Strategy

### Unit Tests
- Node/edge component rendering
- Validation logic
- Import/export transformations
- State management actions

### Integration Tests
- Full editor workflow
- Save/load operations
- Template instantiation
- Keyboard shortcuts

### E2E Tests
- Create flow from scratch
- Import and modify existing flow
- Export and validate JSON
- Deploy flow instance