/**
 * Additional export formats for taxonomies
 *
 * This module provides conversion utilities for various
 * taxonomy export formats beyond SKOS.
 */

import { Taxonomy, TaxonomyConcept } from "../state/taxonomies";

/**
 * Export taxonomy as CSV
 */
export function exportToCSV(taxonomy: Taxonomy): string {
  const concepts = Object.values(taxonomy.concepts);

  // CSV headers
  const headers = [
    "ID",
    "Preferred Label",
    "Alternative Labels",
    "Definition",
    "Scope Note",
    "Examples",
    "Notation",
    "Broader Concept ID",
    "Broader Concept Label",
    "Narrower Concept IDs",
    "Related Concept IDs",
    "Is Top Concept",
  ];

  // Build rows
  const rows = [headers.join(",")];

  concepts.forEach((concept) => {
    const broaderConcept = concept.broader
      ? taxonomy.concepts[concept.broader]
      : null;

    const row = [
      `"${concept.id}"`,
      `"${concept.prefLabel.replace(/"/g, '""')}"`,
      `"${(concept.altLabel || []).join("; ").replace(/"/g, '""')}"`,
      `"${(concept.definition || "").replace(/"/g, '""')}"`,
      `"${(concept.scopeNote || "").replace(/"/g, '""')}"`,
      `"${(concept.example || []).join("; ").replace(/"/g, '""')}"`,
      `"${concept.notation || ""}"`,
      `"${concept.broader || ""}"`,
      `"${broaderConcept ? broaderConcept.prefLabel.replace(/"/g, '""') : ""}"`,
      `"${(concept.narrower || []).join("; ")}"`,
      `"${(concept.related || []).join("; ")}"`,
      `"${concept.topConcept ? "true" : "false"}"`,
    ];

    rows.push(row.join(","));
  });

  return rows.join("\n");
}

/**
 * Export taxonomy as JSON (formatted)
 */
export function exportToJSON(taxonomy: Taxonomy): string {
  return JSON.stringify(taxonomy, null, 2);
}

/**
 * Export taxonomy as plain text outline
 */
export function exportToText(taxonomy: Taxonomy): string {
  const lines = [];

  // Header
  lines.push(`Taxonomy: ${taxonomy.metadata.name}`);
  lines.push(
    `Description: ${taxonomy.metadata.description || "No description"}`,
  );
  lines.push(`Version: ${taxonomy.metadata.version}`);
  lines.push(`Created: ${taxonomy.metadata.created}`);
  lines.push(`Modified: ${taxonomy.metadata.modified}`);
  lines.push(`Creator: ${taxonomy.metadata.creator}`);
  lines.push("");

  // Get hierarchy
  const topConcepts = taxonomy.scheme.hasTopConcept
    .map((id) => taxonomy.concepts[id])
    .filter(Boolean);

  if (topConcepts.length === 0) {
    // If no top concepts defined, find root concepts
    const rootConcepts = Object.values(taxonomy.concepts).filter(
      (c) => !c.broader || !taxonomy.concepts[c.broader],
    );
    topConcepts.push(...rootConcepts);
  }

  // Render hierarchy
  lines.push("CONCEPTS:");
  lines.push("========");
  lines.push("");

  const renderConcept = (
    concept: TaxonomyConcept,
    indent: number = 0,
  ): void => {
    const prefix = "  ".repeat(indent);

    lines.push(`${prefix}• ${concept.prefLabel} (${concept.id})`);

    if (concept.definition) {
      lines.push(`${prefix}  Definition: ${concept.definition}`);
    }

    if (concept.altLabel && concept.altLabel.length > 0) {
      lines.push(
        `${prefix}  Alternative labels: ${concept.altLabel.join(", ")}`,
      );
    }

    if (concept.scopeNote) {
      lines.push(`${prefix}  Scope note: ${concept.scopeNote}`);
    }

    if (concept.example && concept.example.length > 0) {
      lines.push(`${prefix}  Examples: ${concept.example.join(", ")}`);
    }

    if (concept.notation) {
      lines.push(`${prefix}  Notation: ${concept.notation}`);
    }

    if (concept.related && concept.related.length > 0) {
      const relatedLabels = concept.related
        .map((id) => taxonomy.concepts[id]?.prefLabel || id)
        .join(", ");
      lines.push(`${prefix}  Related: ${relatedLabels}`);
    }

    lines.push("");

    // Render narrower concepts
    if (concept.narrower && concept.narrower.length > 0) {
      concept.narrower.forEach((narrowerId) => {
        const narrowerConcept = taxonomy.concepts[narrowerId];
        if (narrowerConcept) {
          renderConcept(narrowerConcept, indent + 1);
        }
      });
    }
  };

  topConcepts.forEach((concept) => renderConcept(concept));

  return lines.join("\n");
}

/**
 * Export taxonomy as GraphML (for network visualization)
 */
export function exportToGraphML(taxonomy: Taxonomy): string {
  const concepts = Object.values(taxonomy.concepts);

  const lines = [];

  // GraphML header
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<graphml xmlns="http://graphml.graphdrawing.org/xmlns"');
  lines.push(
    '         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
  );
  lines.push(
    '         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns',
  );
  lines.push(
    '         http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">',
  );

  // Key definitions
  lines.push(
    '  <key id="label" for="node" attr.name="label" attr.type="string"/>',
  );
  lines.push(
    '  <key id="definition" for="node" attr.name="definition" attr.type="string"/>',
  );
  lines.push(
    '  <key id="type" for="edge" attr.name="type" attr.type="string"/>',
  );
  lines.push("");

  // Graph
  lines.push('  <graph id="taxonomy" edgedefault="directed">');

  // Nodes (concepts)
  concepts.forEach((concept) => {
    lines.push(`    <node id="${concept.id}">`);
    lines.push(
      `      <data key="label">${escapeXML(concept.prefLabel)}</data>`,
    );
    if (concept.definition) {
      lines.push(
        `      <data key="definition">${escapeXML(concept.definition)}</data>`,
      );
    }
    lines.push("    </node>");
  });

  // Edges (relationships)
  concepts.forEach((concept) => {
    // Broader relationships
    if (concept.broader && taxonomy.concepts[concept.broader]) {
      lines.push(
        `    <edge source="${concept.id}" target="${concept.broader}">`,
      );
      lines.push('      <data key="type">broader</data>');
      lines.push("    </edge>");
    }

    // Related relationships
    if (concept.related) {
      concept.related.forEach((relatedId) => {
        if (taxonomy.concepts[relatedId]) {
          lines.push(
            `    <edge source="${concept.id}" target="${relatedId}">`,
          );
          lines.push('      <data key="type">related</data>');
          lines.push("    </edge>");
        }
      });
    }
  });

  lines.push("  </graph>");
  lines.push("</graphml>");

  return lines.join("\n");
}

/**
 * Export taxonomy as DOT format (for Graphviz)
 */
export function exportToDOT(taxonomy: Taxonomy): string {
  const concepts = Object.values(taxonomy.concepts);

  const lines = [];

  lines.push("digraph taxonomy {");
  lines.push("  rankdir=TB;");
  lines.push(
    '  node [shape=box, style="rounded,filled", fillcolor=lightblue];',
  );
  lines.push("  edge [color=darkgreen];");
  lines.push("");

  // Nodes
  concepts.forEach((concept) => {
    const label = concept.prefLabel.replace(/"/g, '\\"');
    const shape = concept.topConcept ? "ellipse" : "box";
    const fillColor = concept.topConcept ? "gold" : "lightblue";

    lines.push(
      `  "${concept.id}" [label="${label}", shape=${shape}, fillcolor=${fillColor}];`,
    );
  });

  lines.push("");

  // Edges
  concepts.forEach((concept) => {
    // Broader relationships (hierarchical)
    if (concept.broader && taxonomy.concepts[concept.broader]) {
      lines.push(
        `  "${concept.broader}" -> "${concept.id}" [label="narrower", color=blue];`,
      );
    }

    // Related relationships
    if (concept.related) {
      concept.related.forEach((relatedId) => {
        if (taxonomy.concepts[relatedId] && concept.id < relatedId) {
          // Only draw one direction to avoid duplicate edges
          lines.push(
            `  "${concept.id}" -> "${relatedId}" [label="related", color=red, dir=both];`,
          );
        }
      });
    }
  });

  lines.push("}");

  return lines.join("\n");
}

/**
 * Get export format information
 */
export const EXPORT_FORMATS = {
  "skos-rdf": {
    name: "SKOS RDF/XML",
    extension: "rdf",
    mimeType: "application/rdf+xml",
    description: "Standard SKOS format in RDF/XML syntax",
  },
  "skos-turtle": {
    name: "SKOS Turtle",
    extension: "ttl",
    mimeType: "text/turtle",
    description: "Standard SKOS format in Turtle syntax",
  },
  json: {
    name: "JSON",
    extension: "json",
    mimeType: "application/json",
    description: "Internal JSON format (for backup/restore)",
  },
  csv: {
    name: "CSV",
    extension: "csv",
    mimeType: "text/csv",
    description: "Comma-separated values (for spreadsheet import)",
  },
  text: {
    name: "Text Outline",
    extension: "txt",
    mimeType: "text/plain",
    description: "Human-readable text outline format",
  },
  graphml: {
    name: "GraphML",
    extension: "graphml",
    mimeType: "application/xml",
    description: "Network graph format (for yEd, Gephi, etc.)",
  },
  dot: {
    name: "DOT/Graphviz",
    extension: "dot",
    mimeType: "text/plain",
    description: "Graphviz format for network visualization",
  },
} as const;

export type ExportFormat = keyof typeof EXPORT_FORMATS;

/**
 * Export taxonomy in specified format
 */
export function exportTaxonomy(
  taxonomy: Taxonomy,
  format: ExportFormat,
): string {
  switch (format) {
    case "csv":
      return exportToCSV(taxonomy);
    case "json":
      return exportToJSON(taxonomy);
    case "text":
      return exportToText(taxonomy);
    case "graphml":
      return exportToGraphML(taxonomy);
    case "dot":
      return exportToDOT(taxonomy);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

// Helper function for XML escaping
function escapeXML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
