# Analysis & Root Causes

## The Core Problem

The Workbench exposes system architecture directly to users instead of translating it into goal-oriented concepts.

## Root Causes

### 1. Architecture-First UI Design

The UI mirrors the backend data model rather than user mental models.

**Example - Flow Creation Dialog:**
```
Current:  "Select flow blueprint" → dropdown of 15+ technical options
          "nlp-chat-graph-rag-document-rag-with-core"

Needed:   "What do you want to do?" → 2-3 clear choices
          "Search documents + build knowledge graph"
```

The `CreateDialog.tsx` component (lines 163-175) directly maps all available blueprints to a flat dropdown with no categorization or guidance.

### 2. Expert-Oriented Terminology

Terms like "flow class", "blueprint", "knowledge core", "GraphRAG" assume domain expertise.

| Technical Term | What Users Think | What It Actually Means |
|---------------|------------------|------------------------|
| Flow class | ? | A template defining processor connections |
| Blueprint | Building plans? | Same as flow class |
| Knowledge core | ? | Persistent storage for extracted knowledge |
| GraphRAG | ? | Retrieval using knowledge graph relationships |

### 3. Flat Information Architecture

All options presented at the same level with equal prominence:
- 15+ flow blueprints in one dropdown
- Many feature switches in sidebar
- No progressive disclosure
- No "happy path" for common use cases

### 4. Missing Conceptual Scaffolding

Users lack a mental model for how pieces fit together:
- What's the relationship between flows and collections?
- How do capabilities combine?
- What's the typical workflow?

No onboarding, wizards, or guided paths exist.

### 5. No "Test Drive" Experience

Users want to see value before understanding details:

> "We want people to see the value of TG and what it does without having to understand all the details of how to do it."

The video game analogy is apt - games have tutorials that guide you through mechanics before dropping you into open play. The Workbench drops users straight into the deep end.

### 6. Power User Features Blocking Basic Use

Features added for specific use cases (guides, API users) are exposed to everyone:
- Many pattern options exist "because they support various guides we've written"
- Advanced parameters shown alongside basic ones
- Specialist features mixed with common ones

## Technical Findings

### Current Flow Creation UI

Location: `src/components/flows/CreateDialog.tsx`

```tsx
// Lines 163-175: All blueprints shown as flat list
const flowBlueprintsOptions = flowBlueprints
  .filter((bp) => bp[1])
  .map((bp) => ({
    value: bp[0],
    label: bp[1].description,
    description: <SelectOption title={bp[1].description}>{bp[0]}</SelectOption>,
  }));
```

**Problems:**
- No categorization
- Technical IDs visible to users
- Descriptions are implementation-focused

### Parameter System

Location: `src/components/flows/ParameterInputs.tsx`

The parameter system is actually well-designed:
- Separates basic vs advanced parameters
- Has collapsible advanced section
- Supports parameter inheritance

**But:** This good design is undermined by the overwhelming blueprint selection that precedes it.

### Navigation Structure

Location: `src/components/Sidebar.tsx`

17 menu items (some feature-switched), mixing:
- Core features (Search, Assistant, Library)
- Advanced features (Ontologies, Schemas, Structured Query)
- Infrastructure (Flows, Flow Blueprints, Knowledge Cores)

No grouping or hierarchy.

## The Fundamental Tension

The Workbench has two conflicting purposes:

1. **Onboarding tool:** "marketing -> learn -> get experience"
2. **Power user workbench:** "a way to work with all the tools"

Currently optimized for #2, but goal is #1.

## What Good Looks Like

The feedback contained the answer:

> "To me, there's vector only and then there's Graph. Then, it's a matter of add-ons. Do you want structured data support? Ontology support?"

This is a **goal-oriented mental model**:
1. Choose your base approach (2 options)
2. Add capabilities (toggles)
3. System handles the technical mapping

The complexity still exists - it's just hidden until needed.
