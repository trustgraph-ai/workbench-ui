# SKOS Taxonomy Management UI Technical Specification

## Overview

This specification describes a user interface component for managing SKOS taxonomies within the existing TrustGraph system. The UI enables data architects to create, edit, and maintain hierarchical taxonomies with rich metadata, supporting multiple concurrent taxonomies stored as configuration items in the backend.

The system supports four primary use cases:

1. **Taxonomy Creation and Management**: Create new taxonomies and manage existing ones through a structured interface
2. **Concept Hierarchy Management**: Build and modify parent-child relationships between taxonomy concepts
3. **Rich Metadata Editing**: Add labels, definitions, examples, and detailed descriptions to concepts
4. **AI-Assisted Content Generation**: Use LLM helpers to generate or enhance taxonomy content

## Goals

- **Intuitive Hierarchy Management**: Provide clear visual representation and manipulation of concept hierarchies
- **Rich Metadata Support**: Enable comprehensive editing of all SKOS properties including labels, definitions, examples, and notes
- **Multi-Taxonomy Support**: Allow data architects to work with multiple taxonomies simultaneously
- **AI-Enhanced Productivity**: Integrate LLM assistance for content generation and taxonomy enhancement
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
- No assistance for content generation
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
   - Key: Unique taxonomy identifier (e.g., `risk_categories`, `document_types`)
   - Value: Complete taxonomy in JSON-LD or Turtle format

3. **SKOS Parser/Serializer Module**
   - Converts between internal JSON representation and standard SKOS formats
   - Supports Turtle and JSON-LD import/export
   - Validates SKOS compliance and structural integrity
   - Handles namespace management and URI generation
   
   Module: workbench-ui/src/utils/skos

4. **LLM Assistant Integration**
   - Connects to existing LLM services for content generation
   - Provides context-aware suggestions for labels, definitions, and examples
   - Supports bulk content enhancement and taxonomy expansion
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
    "creator": "data_architect_001",
    "namespace": "http://example.org/risk/"
  },
  "concepts": {
    "risk_001": {
      "id": "risk_001",
      "prefLabel": "Operational Risk",
      "altLabel": ["Operations Risk", "Op Risk"],
      "definition": "Risk arising from inadequate or failed internal processes",
      "scopeNote": "Includes technology failures, human errors, and process breakdowns...",
      "example": ["IT system outages", "Employee fraud", "Supply chain disruptions"],
      "notation": "1",
      "broader": null,
      "narrower": ["risk_002", "risk_003"],
      "related": [],
      "topConcept": true
    }
  },
  "scheme": {
    "uri": "http://example.org/risk/scheme",
    "prefLabel": "Risk Categories",
    "hasTopConcept": ["risk_001", "risk_010", "risk_020"]
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

**4. AI Assistant Panel**
- Context-aware content suggestions
- Bulk operations: "Generate examples for all concepts"
- Smart templates: "Create child concepts for [parent]"
- Consistency checking: "Find similar concepts"

### AI Assistant Features

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

#### New Frontend APIs

**Taxonomy Management:**
```javascript
// Get all taxonomies
GET /api/config/taxonomy

// Get specific taxonomy
GET /api/config/taxonomy/{taxonomyId}

// Create/update taxonomy
PUT /api/config/taxonomy/{taxonomyId}

// Delete taxonomy
DELETE /api/config/taxonomy/{taxonomyId}

// Validate taxonomy
POST /api/taxonomy/{taxonomyId}/validate

// Export taxonomy
GET /api/taxonomy/{taxonomyId}/export?format={turtle|jsonld|csv}

// Import taxonomy
POST /api/taxonomy/import
```

**AI Assistant APIs:**
```javascript
// Generate content
POST /api/taxonomy/assist/generate
{
  "type": "definition|examples|children",
  "concept": { /* concept data */ },
  "context": { /* taxonomy context */ }
}

// Bulk enhancement
POST /api/taxonomy/assist/enhance
{
  "taxonomyId": "risk_categories",
  "operations": ["fill_definitions", "generate_examples"],
  "conceptIds": ["risk_001", "risk_002"]
}
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

**Phase 3: AI Assistant (Weeks 9-12)**
- LLM integration
- Content generation features
- Bulk enhancement tools

**Phase 4: Import/Export (Weeks 13-16)**
- File format support
- Import/export workflows
- Format conversion utilities

### Timeline

**Total Duration**: 16 weeks

**Milestones:**
- Week 4: Basic taxonomy management functional
- Week 8: Complete hierarchy editing capabilities
- Week 12: AI assistant fully integrated
- Week 16: Full feature set with import/export

### Open Questions

- Should we support collaborative editing features in the future?
- Do we need integration with external taxonomy services (e.g., Library of Congress)?
- Should the system support taxonomy versioning and branching?
- How should we handle very large taxonomies (1000+ concepts)?
- Do we need offline editing capabilities?

### References

- [SKOS Simple Knowledge Organization System Reference](https://www.w3.org/TR/skos-reference/)
- [JSON-LD 1.1 Specification](https://www.w3.org/TR/json-ld11/)
- [Turtle RDF Syntax](https://www.w3.org/TR/turtle/)
- [Dublin Core Metadata Terms](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/)

