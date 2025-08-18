# SKOS Taxonomy Management UI Technical Specification

## Overview

This specification describes a user interface component for managing SKOS taxonomies within the existing TrustGraph system. The UI enables data architects to create, edit, and maintain hierarchical taxonomies with rich metadata, supporting multiple concurrent taxonomies stored as configuration items in the backend.

**Naming Convention**: This project uses kebab-case for all identifiers (configuration keys, API endpoints, module names, etc.) rather than snake_case.

The system supports four primary use cases:

1. **Taxonomy Creation and Management**: Create new taxonomies and manage existing ones through a structured interface
2. **Concept Hierarchy Management**: Build and modify parent-child relationships between taxonomy concepts
3. **Rich Metadata Editing**: Add labels, definitions, examples, and detailed descriptions to concepts
4. **AI-Assisted Content Generation**: Optional wizard/getting started flow using LLM helpers to generate or enhance taxonomy content

## Goals

- **Intuitive Hierarchy Management**: Provide clear visual representation and manipulation of concept hierarchies
- **Rich Metadata Support**: Enable comprehensive editing of all SKOS properties including labels, definitions, examples, and notes
- **Multi-Taxonomy Support**: Allow data architects to work with multiple taxonomies simultaneously
- **AI-Enhanced Productivity**: Provide optional LLM assistance for content generation and taxonomy enhancement
- **Configuration Integration**: Seamlessly store and retrieve taxonomies from the existing configuration backend
- **Data Architect Focus**: Design interfaces that expose technical details and provide precise control over taxonomy structure
- **Validation and Consistency**: Ensure taxonomies conform to SKOS standards and maintain internal consistency
- **Import/Export Capabilities**: Support standard formats (Turtle, JSON-LD) for taxonomy interchange

## Background

TrustGraph currently stores configuration data in a flexible key-value system that can accommodate various data types. SKOS taxonomies represent a structured knowledge organization system that needs to be managed through dedicated tooling rather than raw configuration editing.

Data architects working with knowledge graphs need taxonomies to:
- Standardize terminology across data sources
- Provide controlled vocabularies for content classification
- Enable semantic relationships between concepts
- Support knowledge extraction and entity recognition workflows

Current limitations include:
- No dedicated UI for taxonomy management
- Manual editing of complex hierarchical structures
- Difficulty maintaining SKOS compliance
- No automated assistance for content generation
- Limited validation of taxonomy consistency

This specification addresses these gaps by providing a specialized interface that understands SKOS semantics while integrating with the existing configuration infrastructure.

## Technical Design

### Architecture

The taxonomy management UI requires the following components:

1. **Taxonomy Manager Component**
   - React-based interface component for the main taxonomy management workspace
   - Integrates with existing UI framework and design system
   - Provides tree view, detail panels, and editing interfaces
   - Supports undo/redo operations and change tracking
   
   Module: workbench-ui/src/components/TaxonomyManager

2. **Configuration API Integration** ✅ **[EXISTING]**
   - Extends existing configuration API to handle taxonomy-specific operations
   - Type: `taxonomy` for all SKOS taxonomy configurations
   - Key: Unique taxonomy identifier (e.g., `risk-categories`, `document-types`)
   - Value: Complete taxonomy in JSON-LD or Turtle format

3. **SKOS Parser/Serializer Module**
   - Converts between internal JSON representation and standard SKOS formats
   - Supports Turtle and JSON-LD import/export
   - Validates SKOS compliance and structural integrity
   - Handles namespace management and URI generation
   
   Module: workbench-ui/src/utils/skos

4. **LLM Assistant Integration (Optional)**
   - Provides an optional wizard/getting started flow for new taxonomies
   - Connects to existing LLM services for content generation
   - Offers context-aware suggestions for labels, definitions, and examples
   - Supports bulk content enhancement and taxonomy expansion
   - Can be bypassed entirely for manual taxonomy creation
   - Maintains consistency with existing concept definitions
   
   Module: workbench-ui/src/services/taxonomyAssistant

5. **Hierarchy Visualization Component**
   - Tree-based visual representation of concept hierarchies
   - Drag-and-drop support for restructuring
   - Visual indicators for concept completeness and validation status
   - Search and filtering capabilities
   
   Module: workbench-ui/src/components/TaxonomyTree

6. **Concept Editor Component**
   - Form-based interface for editing individual concepts
   - Dedicated sections for each SKOS property type
   - Real-time validation and suggestion features
   - Preview of generated RDF/Turtle output
   
   Module: workbench-ui/src/components/ConceptEditor

7. **Taxonomy Import/Export Service**
   - Handles file uploads and downloads
   - Supports multiple formats (Turtle, JSON-LD, CSV templates)
   - Provides format conversion and validation
   - Manages conflict resolution during imports
   
   Module: workbench-ui/src/services/taxonomyIO

### Data Models

#### Internal Representation

Taxonomies are stored as configuration items with the following structure:

**Configuration Schema:**
```
Type: taxonomy
Key: [taxonomy_identifier]
Value: {
  "metadata": {
    "name": "Risk Categories",
    "description": "Comprehensive risk classification taxonomy",
    "version": "1.2",
    "created": "2025-01-15T10:30:00Z",
    "modified": "2025-08-15T14:22:00Z",
    "creator": "data-architect-001",
    "namespace": "http://example.org/risk/"
  },
  "concepts": {
    "risk-001": {
      "id": "risk-001",
      "prefLabel": "Operational Risk",
      "altLabel": ["Operations Risk", "Op Risk"],
      "definition": "Risk arising from inadequate or failed internal processes",
      "scopeNote": "Includes technology failures, human errors, and process breakdowns...",
      "example": ["IT system outages", "Employee fraud", "Supply chain disruptions"],
      "notation": "1",
      "broader": null,
      "narrower": ["risk-002", "risk-003"],
      "related": [],
      "topConcept": true
    }
  },
  "scheme": {
    "uri": "http://example.org/risk/scheme",
    "prefLabel": "Risk Categories",
    "hasTopConcept": ["risk-001", "risk-010", "risk-020"]
  }
}
```

#### SKOS Property Mapping

The UI supports all essential SKOS properties:

**Core Properties:**
- `skos:prefLabel` - Primary concept name
- `skos:altLabel` - Alternative names/synonyms
- `skos:definition` - Brief formal definition
- `skos:notation` - Hierarchical code (auto-generated or manual)

**Hierarchical Properties:**
- `skos:broader` - Parent concept reference
- `skos:narrower` - Child concept references
- `skos:topConceptOf` - Root level indicator
- `skos:related` - Non-hierarchical associations

**Documentation Properties:**
- `skos:scopeNote` - Detailed analytical commentary
- `skos:example` - Real-world examples and case studies
- `skos:note` - General annotations
- `skos:editorialNote` - Internal management notes
- `skos:changeNote` - Version history tracking

**Extended Properties:**
- `dc:description` - Extended narrative description
- Custom properties for domain-specific metadata

### User Interface Design

#### Main Workspace Layout

```
+----------------------------------------------------------+
| Taxonomy Manager                                    [?] [⚙] |
+----------------------------------------------------------+
| [Taxonomies ▼] [+ New] [Import] [Export]                |
+------------------+---------------------------------------+
| Taxonomy Tree    | Concept Details                       |
| +--------------+ | +-----------------------------------+ |
| | □ Risk Cat.  | | | Concept: Operational Risk         | |
| |   ├─ Op Risk | | | ┌─ Basic Info ──────────────────┐ | |
| |   │  ├─ Tech | | | │ Preferred Label: [____________] │ | |
| |   │  └─ Human| | | │ Alternative Labels: [Add new_] │ | |
| |   ├─ Market  | | | │ Notation: [____] Auto: □       │ | |
| |   └─ Credit  | | | └─────────────────────────────────┘ | |
| | [+ Add Root] | | | ┌─ Definition ───────────────────┐ | |
| | [🔍 Search_] | | | │ [__________________________ ] │ | |
| +--------------+ | | │ [AI Suggest] [Generate Example] │ | |
|                  | | └─────────────────────────────────┘ | |
+------------------+---------------------------------------+
```

#### Core UI Components

**1. Taxonomy Selector**
- Dropdown showing all available taxonomies
- Quick actions: New, Clone, Delete
- Status indicators: Modified, Validated, Published

**2. Hierarchy Tree**
- Expandable tree view with drag-and-drop
- Visual indicators: ✓ Complete, ⚠ Missing data, ❌ Validation errors
- Context menu: Add Child, Edit, Delete, Move
- Search with highlighting and filtering

**3. Concept Detail Panel**
- Tabbed interface for different property groups:
  - **Basic Info**: Labels, notation, basic relationships
  - **Definition**: Core definition and scope notes
  - **Examples**: Real-world cases and use examples
  - **Relationships**: Broader, narrower, and related concepts
  - **Metadata**: Editorial notes, change history, custom properties

**4. AI Assistant Panel (Optional)**
- Toggle on/off for manual-only workflow
- When enabled, provides:
  - Context-aware content suggestions
  - Bulk operations: "Generate examples for all concepts"
  - Smart templates: "Create child concepts for [parent]"
  - Consistency checking: "Find similar concepts"
- Can be hidden completely for users preferring manual creation

### AI Assistant Features (Optional Wizard)

The AI Assistant is designed as an optional "getting started" wizard that helps users bootstrap their taxonomies. Users can:
- Choose to start with the AI wizard or create taxonomies manually from scratch
- Toggle AI assistance on/off at any point during editing
- Use AI for specific tasks (e.g., generating examples) while doing everything else manually
- Skip the wizard entirely and build taxonomies using traditional manual methods

#### Content Generation Capabilities

**Definition Assistant**
- Analyzes concept label and position in hierarchy
- Generates formal definitions following domain standards
- Suggests scope notes with technical detail
- Maintains consistency with sibling concepts

**Example Generator**
- Creates relevant real-world examples
- Considers concept specificity and domain context
- Generates diverse example types (events, entities, scenarios)
- Validates examples against concept definition

**Hierarchy Suggestions**
- Recommends child concepts for expansion
- Identifies potential parent-child relationships
- Suggests related concepts across branches
- Detects hierarchy inconsistencies

**Bulk Enhancement**
- Processes multiple concepts simultaneously
- Maintains stylistic consistency across taxonomy
- Fills in missing properties systematically
- Provides quality scoring and recommendations

#### Implementation Details

**Assistant Integration:**
```javascript
const assistantService = {
  generateDefinition: async (concept, context) => {
    // Send concept label, siblings, and domain context to LLM
    // Return structured definition with confidence score
  },
  
  suggestExamples: async (concept, count = 3) => {
    // Generate contextually appropriate examples
    // Filter for relevance and diversity
  },
  
  expandHierarchy: async (parentConcept, depth = 2) => {
    // Suggest logical child concepts
    // Maintain naming and structural consistency
  }
};
```

### APIs

#### Using the Existing Config API

The taxonomy management system uses the existing configuration API with type `taxonomy`. No new API endpoints are needed - all operations go through the existing socket-based config API.

**React Hook Implementation (following the established pattern):**

```typescript
// src/state/taxonomies.ts
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useSocket } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";

export const useTaxonomies = () => {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const notify = useNotification();

  // Fetch all taxonomies using getValues
  const taxonomiesQuery = useQuery({
    queryKey: ["taxonomies"],
    queryFn: () => {
      return socket
        .config()
        .getValues("taxonomy")
        .then((values) => {
          // Returns array of [id, taxonomyData] tuples
          return values.map((item) => [item.key, JSON.parse(item.value)]);
        })
        .catch((err) => {
          console.log("Error:", err);
          throw err;
        });
    },
  });

  // Create/Update taxonomy mutation
  const updateTaxonomyMutation = useMutation({
    mutationFn: ({ id, taxonomy, onSuccess }) => {
      return socket
        .config()
        .putConfig([
          {
            type: "taxonomy",
            key: id,
            value: JSON.stringify(taxonomy),
          },
        ])
        .then((x) => {
          if (x["error"]) {
            console.log("Error:", x);
            throw x.error.message;
          }
          if (onSuccess) onSuccess();
        });
    },
    onError: (err) => {
      console.log("Error:", err);
      notify.error(err.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxonomies"] });
      notify.success("Taxonomy updated");
    },
  });

  // Delete taxonomy mutation
  const deleteTaxonomyMutation = useMutation({
    mutationFn: ({ id, onSuccess }) => {
      return socket
        .config()
        .deleteConfig([
          {
            type: "taxonomy",
            key: id,
          },
        ])
        .then((x) => {
          if (x["error"]) {
            console.log("Error:", x);
            throw x.error.message;
          }
          if (onSuccess) onSuccess();
        });
    },
    onError: (err) => {
      console.log("Error:", err);
      notify.error(err.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxonomies"] });
      notify.success("Taxonomy deleted");
    },
  });

  // Track loading states
  useActivity(taxonomiesQuery.isLoading, "Loading taxonomies");
  useActivity(updateTaxonomyMutation.isPending, "Updating taxonomy");
  useActivity(deleteTaxonomyMutation.isPending, "Deleting taxonomy");

  return {
    taxonomies: taxonomiesQuery.data || [],
    taxonomiesLoading: taxonomiesQuery.isLoading,
    taxonomiesError: taxonomiesQuery.error,
    
    updateTaxonomy: updateTaxonomyMutation.mutate,
    isUpdatingTaxonomy: updateTaxonomyMutation.isPending,
    
    createTaxonomy: updateTaxonomyMutation.mutate, // Same as update
    isCreatingTaxonomy: updateTaxonomyMutation.isPending,
    
    deleteTaxonomy: deleteTaxonomyMutation.mutate,
    isDeletingTaxonomy: deleteTaxonomyMutation.isPending,
    
    refetch: () => taxonomiesQuery.refetch(),
  };
};
```

**AI Assistant APIs:**

The AI assistant functionality will use the existing LLM integration through the socket API. No new endpoints needed - the assistant will use the existing prompt/completion mechanisms.

### Table Component Implementation

Following the established pattern using Tanstack Table:

**Table Column Definition:**

```typescript
// src/model/taxonomies-table.tsx
import { createColumnHelper } from "@tanstack/react-table";

export type TaxonomyTableRow = [string, {
  metadata: {
    name: string;
    description: string;
    version: string;
    modified: string;
    creator: string;
  };
  concepts: Record<string, any>;
  scheme: any;
}];

const columnHelper = createColumnHelper<TaxonomyTableRow>();

export const taxonomyColumns = [
  columnHelper.accessor((row) => row[0], {
    id: "id",
    header: "ID",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((row) => row[1].metadata.name, {
    id: "name", 
    header: "Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((row) => row[1].metadata.description, {
    id: "description",
    header: "Description",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor((row) => Object.keys(row[1].concepts).length, {
    id: "conceptCount",
    header: "Concepts",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((row) => row[1].metadata.modified, {
    id: "modified",
    header: "Last Modified",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
];
```

**Table Component:**

```typescript
// src/components/taxonomies/TaxonomiesTable.tsx
import React from "react";
import { Box, Table, Text, Spinner, Center } from "@chakra-ui/react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useTaxonomies } from "../../state/taxonomies";
import { TaxonomyTableRow, taxonomyColumns } from "../../model/taxonomies-table";
import { EditTaxonomyDialog } from "./EditTaxonomyDialog";

export const TaxonomiesTable: React.FC = () => {
  const { taxonomies, taxonomiesLoading, taxonomiesError } = useTaxonomies();
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedTaxonomy, setSelectedTaxonomy] = 
    React.useState<TaxonomyTableRow | null>(null);

  const table = useReactTable({
    data: taxonomies as TaxonomyTableRow[],
    columns: taxonomyColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleRowClick = (row: TaxonomyTableRow) => {
    setSelectedTaxonomy(row);
    setIsOpen(true);
  };

  if (taxonomiesLoading) {
    return (
      <Center h="200px">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (taxonomiesError) {
    return (
      <Box p={4} borderWidth="1px" borderColor="red.500" borderRadius="md" bg="red.50">
        <Text color="red.700">
          Error loading taxonomies: {taxonomiesError.toString()}
        </Text>
      </Box>
    );
  }

  if (taxonomies.length === 0) {
    return (
      <Center h="200px">
        <Text color="gray.500">
          No taxonomies found. Create one to get started.
        </Text>
      </Center>
    );
  }

  return (
    <>
      <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
        <Table.Root interactive>
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeader key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows.map((row) => (
              <Table.Row
                key={row.id}
                onClick={() => handleRowClick(row.original)}
                style={{ cursor: "pointer" }}
              >
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {selectedTaxonomy && (
        <EditTaxonomyDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          mode="edit"
          taxonomyId={selectedTaxonomy[0]}
          initialTaxonomy={selectedTaxonomy[1]}
        />
      )}
    </>
  );
};
```

### Validation and Quality Assurance

#### SKOS Compliance Checking

**Structural Validation:**
- Verify proper concept scheme structure
- Check for circular hierarchical references
- Validate URI consistency and namespace usage
- Ensure required properties are present

**Content Quality:**
- Check for duplicate or conflicting labels
- Validate definition completeness and clarity
- Verify example relevance and accuracy
- Detect inconsistent notation schemes

**Relationship Integrity:**
- Ensure bidirectional relationship consistency
- Validate broader/narrower relationships
- Check for orphaned concepts
- Detect missing top concepts

#### Real-time Validation

```javascript
const validator = {
  validateConcept: (concept, taxonomy) => {
    return {
      isValid: boolean,
      errors: [{ field, message, severity }],
      warnings: [{ field, message, suggestion }],
      completeness: percentage
    };
  },
  
  validateTaxonomy: (taxonomy) => {
    return {
      isValid: boolean,
      conceptErrors: { conceptId: [errors] },
      structuralIssues: [issues],
      qualityScore: percentage
    };
  }
};
```

### Import/Export Functionality

#### Supported Formats

**Turtle (.ttl)**
- Standard SKOS representation
- Full property support
- Namespace management
- Human-readable format

**JSON-LD (.jsonld)**
- Web-friendly JSON format
- Linked data compatibility
- API integration ready
- Compact representation

**CSV Template**
- Spreadsheet-friendly format
- Bulk concept creation
- Simplified property mapping
- Non-technical user support

#### Import Process

1. **File Upload**: Drag-and-drop or file picker
2. **Format Detection**: Automatic format recognition
3. **Preview**: Show parsed content before import
4. **Conflict Resolution**: Handle duplicate concepts
5. **Validation**: Check SKOS compliance
6. **Import Execution**: Create configuration entries

### Security Considerations

**Access Control:**
- Integrate with existing user authentication
- Role-based permissions for taxonomy editing
- Audit trail for all modifications
- Version control for taxonomy changes

**Data Validation:**
- Sanitize all user inputs
- Validate file uploads for malicious content
- Limit taxonomy size and complexity
- Rate limiting for AI assistant requests

### Performance Considerations

**Frontend Optimization:**
- Virtual scrolling for large taxonomies
- Lazy loading of concept details
- Debounced search and filtering
- Optimistic UI updates with rollback

**Backend Efficiency:**
- Efficient configuration storage queries
- Caching for frequently accessed taxonomies
- Batch operations for bulk modifications
- Async processing for large imports

### Testing Strategy

**Unit Testing:**
- Component testing for UI elements
- SKOS parser/serializer validation
- AI assistant response handling
- Import/export functionality

**Integration Testing:**
- Configuration API integration
- Full taxonomy CRUD operations
- Import/export round-trip testing
- AI assistant service integration

**User Acceptance Testing:**
- Data architect workflow validation
- Taxonomy creation scenarios
- Bulk editing operations
- Import/export with real data

### Migration Plan

**Phase 1: Core UI (Weeks 1-4)**
- Basic taxonomy management interface
- Configuration API integration
- Simple CRUD operations

**Phase 2: Hierarchy Management (Weeks 5-8)**
- Tree visualization component
- Drag-and-drop functionality
- Relationship management

**Phase 3: AI Assistant Wizard (Weeks 9-12)**
- Optional LLM integration
- "Getting started" wizard flow
- Content generation features
- Bulk enhancement tools
- Manual-only mode support

**Phase 4: Import/Export (Weeks 13-16)**
- File format support
- Import/export workflows
- Format conversion utilities

### Timeline

**Total Duration**: 16 weeks

**Milestones:**
- Week 4: Basic taxonomy management functional (manual creation)
- Week 8: Complete hierarchy editing capabilities
- Week 12: Optional AI assistant wizard fully integrated
- Week 16: Full feature set with import/export

### Open Questions

- Do we need integration with external taxonomy services (e.g., Library of Congress, schema.org)? Not needed currently.
- Should the system support taxonomy versioning and branching? No.
- How should we handle very large taxonomies (1000+ concepts)? No explicit support needed at the moment.
- Do we need offline editing capabilities? No.

### References

- [SKOS Simple Knowledge Organization System Reference](https://www.w3.org/TR/skos-reference/)
- [JSON-LD 1.1 Specification](https://www.w3.org/TR/json-ld11/)
- [Turtle RDF Syntax](https://www.w3.org/TR/turtle/)
- [Dublin Core Metadata Terms](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/)

