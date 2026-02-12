# Proposals

## Core Insight

The feedback is not asking for incremental improvements to the Workbench. It's asking for a fundamental restructuring of the user experience.

**Current state:** Workbench is the primary interface. Users land in a complex tool and must figure it out.

**Proposed state:** Guided experience is the primary interface. Users start with curated demos that guarantee success. The Workbench becomes "power tools" for users who want to go deeper.

```
CURRENT:
┌─────────────────────────────────┐
│         Workbench               │  ← New users land here
│   (overwhelming, complex)       │     (confused, give up)
└─────────────────────────────────┘

PROPOSED:
┌─────────────────────────────────┐
│      Guided Experience          │  ← New users land here
│      (Learning Pathways)        │     (guaranteed success)
└───────────────┬─────────────────┘
                │
                │ "I want to explore more"
                ▼
┌─────────────────────────────────┐
│         Workbench               │  ← Power users opt-in
│      (full functionality)       │
└─────────────────────────────────┘
```

---

# Learning Pathways

The learning pathways are the heart of this proposal. Each pathway teaches a concept through doing, not explaining.

---

## Pathway 1: What is a Context Graph?

**Goal:** User understands what a context graph is and sees it working.

### Step 1: Start with a question that works

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Let's ask a question.                                      │
│                                                             │
│  We've loaded some data about concert performances.         │
│  Try asking:                                                │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ "How many times did Metallica play Master of Puppets  │  │
│  │  in 2023?"                                            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│                              [Ask TrustGraph →]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 2: See the answer

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Answer: 47 times                                           │
│                                                             │
│  TrustGraph found this by navigating your data.             │
│  Let's see how.                                             │
│                                                             │
│                              [Show me how →]                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 3: Visualize the graph traversal

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Here's how TrustGraph found the answer:                    │
│                                                             │
│      ┌───────────┐                                          │
│      │ Metallica │                                          │
│      └─────┬─────┘                                          │
│            │ performed_at                                   │
│            ▼                                                │
│      ┌───────────┐      ┌─────────────────┐                │
│      │ Concert 1 │──────│ Master of       │                │
│      │ 2023-03-15│      │ Puppets         │                │
│      └───────────┘      └─────────────────┘                │
│            │                    ▲                           │
│            │                    │ setlist_included          │
│      ┌───────────┐              │                           │
│      │ Concert 2 │──────────────┘                           │
│      │ 2023-04-22│                                          │
│      └───────────┘                                          │
│            │                                                │
│           ...                                               │
│        (47 concerts)                                        │
│                                                             │
│  The context graph connects artists → concerts → songs.     │
│  TrustGraph traversed these connections to count: 47.       │
│                                                             │
│                              [Got it →]                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: What is a context graph?

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  What you just saw is a CONTEXT GRAPH.                      │
│                                                             │
│  A context graph is:                                        │
│  • Your data, organized as connected entities               │
│  • Relationships that link things together                  │
│  • A structure that AI can navigate to find answers         │
│                                                             │
│  Without this graph, an AI would have to guess.             │
│  With it, the AI can follow the connections to the truth.   │
│                                                             │
│                              [Try another question →]       │
│                              [Why does this matter? →]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 5: Try variations (optional)

Let user ask related questions against the same dataset:
- "Which songs did Metallica play most often in 2023?"
- "What venues did they perform at in California?"
- "Did they ever play Master of Puppets and One in the same show?"

Each time, show the graph traversal that produced the answer.

---

## Pathway 2: Why Context Graphs?

**Goal:** User understands why context graphs exist - what fails without them.

### Step 1: The problem with basic search

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Let's see what happens WITHOUT a context graph.            │
│                                                             │
│  Basic vector search finds documents that "seem related"    │
│  to your question. Let's try it.                            │
│                                                             │
│  Question: "What products did customer #4521 buy last       │
│  month?"                                                    │
│                                                             │
│                              [Search with vectors only →]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 2: Vector search results

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Vector search found these "similar" documents:             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📄 "Customer Purchase Policy v2.3"                   │   │
│  │    ...customers may purchase products...             │   │
│  │    Relevance: 0.82                                   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 📄 "Product Catalog - Electronics"                   │   │
│  │    ...products available for purchase...             │   │
│  │    Relevance: 0.79                                   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 📄 "Monthly Sales Report - Summary"                  │   │
│  │    ...last month's top products...                   │   │
│  │    Relevance: 0.76                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ❌ None of these contain customer #4521's actual orders.   │
│                                                             │
│  Vector search matched WORDS, not RELATIONSHIPS.            │
│                                                             │
│                              [See what context graph does →]│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 3: Context graph results

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Now let's ask the context graph:                           │
│                                                             │
│  ┌──────────────┐     ┌─────────────┐     ┌──────────────┐ │
│  │ Customer     │     │ Order       │     │ Product      │ │
│  │ #4521        │────▶│ #98234      │────▶│ Widget Pro   │ │
│  │ "Jane Smith" │     │ 2024-01-15  │     │ $49.99       │ │
│  └──────────────┘     └─────────────┘     └──────────────┘ │
│         │                                                   │
│         │             ┌─────────────┐     ┌──────────────┐ │
│         └────────────▶│ Order       │────▶│ Gadget X     │ │
│                       │ #98267      │     │ $29.99       │ │
│                       │ 2024-01-22  │     └──────────────┘ │
│                       └─────────────┘                       │
│                                                             │
│  ✓ Answer: Widget Pro ($49.99) and Gadget X ($29.99)       │
│                                                             │
│  The context graph followed: Customer → Orders → Products   │
│                                                             │
│                              [Next: Why LLMs fail →]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: Why LLMs fail without context

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Let's ask ChatGPT the Metallica question:                  │
│                                                             │
│  "How many times did Metallica play Master of Puppets       │
│   in 2023?"                                                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🤖 ChatGPT:                                          │   │
│  │                                                      │   │
│  │ "I don't have access to specific concert setlist    │   │
│  │ data for 2023. However, Master of Puppets is one    │   │
│  │ of Metallica's most popular songs and they likely   │   │
│  │ played it frequently during their tours..."         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ❌ ChatGPT doesn't know. It can only guess.                │
│                                                             │
│  LLMs have general knowledge, but not YOUR data.            │
│  They can't count, traverse relationships, or verify facts. │
│                                                             │
│                              [The solution →]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 5: The aha moment

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  This is why TrustGraph exists.                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │   Your Data  ───▶  Context Graph  ───▶  AI Agent    │   │
│  │                                                      │   │
│  │   Documents       Entities &          Accurate      │   │
│  │   Records         Relationships       Answers       │   │
│  │   Files                                             │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  TrustGraph:                                                │
│  • Builds the context graph from your data                  │
│  • Manages it as your data changes                          │
│  • Gives AI agents the context they need                    │
│                                                             │
│  Your agents stop guessing and start knowing.               │
│                                                             │
│                              [Build your own graph →]       │
│                              [Explore more demos →]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Pathway 3: Build Your Own (Future)

**Goal:** User creates their own context graph from a document.

- Upload a document (or use sample)
- Watch TrustGraph extract entities
- See relationships form
- Ask questions against their own data
- "This is yours now"

---

## Landing Page

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      TrustGraph                             │
│                                                             │
│           Context graphs that make AI accurate              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │  📊 What is a Context Graph?                [Start]  │   │
│  │     See how connected data powers accurate answers   │   │
│  │                                                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                      │   │
│  │  🔍 Why Context Graphs?                     [Start]  │   │
│  │     Learn why vector search and LLMs aren't enough   │   │
│  │                                                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                      │   │
│  │  🛠️ Build Your Own                          [Start]  │   │
│  │     Create a context graph from your documents       │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                                                             │
│              [Power Tools (Workbench) →]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Open Questions

1. **What pre-loaded datasets to use?**
   - Concert/setlist data (verifiable, fun)
   - E-commerce orders (relatable, business-relevant)
   - Something else?

2. **Technical approach?**
   - Separate app vs mode in current app
   - How to present simplified UI during demos

3. **How does user transition to Workbench?**
   - After completing pathways?
   - Available anytime?

4. **What happens to existing Workbench URL?**

---

## What This Replaces

Previous proposals focused on incremental Workbench fixes. Those may still be relevant for the power tools portion, but learning pathways are the priority.
