import {
  Ontology,
  OWLClass,
  OWLObjectProperty,
  OWLDatatypeProperty,
  OntologyMetadata,
} from "@trustgraph/react-state";

export type ImportFormat = "owl" | "rdf" | "turtle";

export interface ImportOptions {
  format: ImportFormat;
  overwriteExisting?: boolean;
  mergeWithExisting?: boolean;
}

export class OntologyImporter {
  static async import(
    content: string,
    options: ImportOptions,
  ): Promise<Ontology> {
    switch (options.format) {
      case "owl":
        return this.parseOWL(content);
      case "rdf":
        return this.parseRDF(content);
      case "turtle":
        return this.parseTurtle(content);
      default:
        throw new Error(`Unsupported import format: ${options.format}`);
    }
  }

  static detectFormat(content: string): ImportFormat | null {
    // Trim and get first meaningful line
    const trimmed = content.trim();

    // Check for OWL/XML
    if (
      trimmed.startsWith("<?xml") ||
      trimmed.includes("<rdf:RDF") ||
      trimmed.includes("<owl:Ontology")
    ) {
      // Distinguish between OWL and RDF
      if (trimmed.includes("<owl:Ontology") || trimmed.includes("owl:Class")) {
        return "owl";
      }
      return "rdf";
    }

    // Check for Turtle
    if (
      trimmed.includes("@prefix") ||
      trimmed.includes("@base") ||
      trimmed.includes("a owl:") ||
      trimmed.includes("a rdfs:")
    ) {
      return "turtle";
    }

    return null;
  }

  private static parseOWL(content: string): Ontology {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/xml");

    // Check for parse errors
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      throw new Error("Invalid XML/OWL format: " + parseError.textContent);
    }

    // Extract ontology metadata
    const ontologyElement = doc.querySelector("Ontology");
    const metadata = this.extractMetadata(doc, ontologyElement);

    // Extract classes
    const classes: Record<string, OWLClass> = {};
    const classElements = doc.querySelectorAll("Class");

    classElements.forEach((classEl) => {
      const uri =
        classEl.getAttribute("rdf:about") ||
        classEl.getAttribute("rdf:ID") ||
        "";
      if (!uri) return;

      const classId = this.extractId(uri, metadata.namespace);
      const labels = this.extractLabels(classEl);
      const comment = this.extractComment(classEl);
      const subClassOf = this.extractSubClassOf(classEl, metadata.namespace);

      classes[classId] = {
        uri,
        type: "owl:Class",
        "rdfs:label": labels.length > 0 ? labels : undefined,
        "rdfs:comment": comment || undefined,
        "rdfs:subClassOf": subClassOf || undefined,
      };
    });

    // Extract object properties
    const objectProperties: Record<string, OWLObjectProperty> = {};
    const objectPropElements = doc.querySelectorAll("ObjectProperty");

    objectPropElements.forEach((propEl) => {
      const uri =
        propEl.getAttribute("rdf:about") ||
        propEl.getAttribute("rdf:ID") ||
        "";
      if (!uri) return;

      const propId = this.extractId(uri, metadata.namespace);
      const labels = this.extractLabels(propEl);
      const comment = this.extractComment(propEl);
      const domain = this.extractDomain(propEl, metadata.namespace);
      const range = this.extractRange(propEl, metadata.namespace);

      objectProperties[propId] = {
        uri,
        type: "owl:ObjectProperty",
        "rdfs:label": labels.length > 0 ? labels : undefined,
        "rdfs:comment": comment || undefined,
        "rdfs:domain": domain || undefined,
        "rdfs:range": range || undefined,
      };
    });

    // Extract datatype properties
    const datatypeProperties: Record<string, OWLDatatypeProperty> = {};
    const datatypePropElements = doc.querySelectorAll("DatatypeProperty");

    datatypePropElements.forEach((propEl) => {
      const uri =
        propEl.getAttribute("rdf:about") ||
        propEl.getAttribute("rdf:ID") ||
        "";
      if (!uri) return;

      const propId = this.extractId(uri, metadata.namespace);
      const labels = this.extractLabels(propEl);
      const comment = this.extractComment(propEl);
      const domain = this.extractDomain(propEl, metadata.namespace);
      const range =
        propEl.querySelector("range")?.getAttribute("rdf:resource") ||
        "xsd:string";

      datatypeProperties[propId] = {
        uri,
        type: "owl:DatatypeProperty",
        "rdfs:label": labels.length > 0 ? labels : undefined,
        "rdfs:comment": comment || undefined,
        "rdfs:domain": domain || undefined,
        "rdfs:range": range.includes("xsd:") ? range : "xsd:string",
      };
    });

    return {
      metadata,
      classes,
      objectProperties,
      datatypeProperties,
    };
  }

  private static parseRDF(content: string): Ontology {
    // RDF/XML is similar to OWL/XML but with different namespace usage
    // For now, we'll use the same parser with slight modifications
    return this.parseOWL(content);
  }

  private static parseTurtle(content: string): Ontology {
    const metadata: OntologyMetadata = {
      name: "Imported Ontology",
      description: "",
      version: "1.0",
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      creator: "",
      namespace: "",
    };

    const classes: Record<string, OWLClass> = {};
    const objectProperties: Record<string, OWLObjectProperty> = {};
    const datatypeProperties: Record<string, OWLDatatypeProperty> = {};

    // Extract namespace from @prefix or @base
    let ontologyPrefix = "";
    const namespaceMatch = content.match(/@base\s+<([^>]+)>/);
    if (namespaceMatch) {
      metadata.namespace = namespaceMatch[1];
      // Find the prefix that maps to this namespace
      const prefixMatch = content.match(new RegExp(`@prefix\\s+(\\w+):\\s+<${metadata.namespace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}>`));
      if (prefixMatch) {
        ontologyPrefix = prefixMatch[1];
      }
    } else {
      const prefixMatch = content.match(/@prefix\s+(\w*):?\s+<([^>]+)>/);
      if (prefixMatch) {
        ontologyPrefix = prefixMatch[1] || "";
        metadata.namespace = prefixMatch[2];
      }
    }

    // Simple Turtle parser - this is a basic implementation
    // Split into statements (each ending with " ." - space + period + newline)
    // This avoids splitting on periods inside quoted strings
    const statements = content.split(/\s\.\s*\n/).filter((s) => s.trim());

    // Extract ontology metadata from the ontology declaration
    for (const statement of statements) {
      if (statement.includes("a owl:Ontology")) {
        const lines = statement.split("\n").map((l) => l.trim());
        const propsText = lines.join(" ");

        // Extract title from dcterms:title or rdfs:label
        const titleMatch = propsText.match(/(?:dcterms:title|rdfs:label)\s+"([^"]+)"/);
        if (titleMatch) {
          metadata.name = titleMatch[1];
        }

        // Extract description from rdfs:comment
        const commentMatch = propsText.match(/rdfs:comment\s+"([^"]+)"/);
        if (commentMatch) {
          metadata.description = commentMatch[1];
        }

        // Extract version from owl:versionInfo or provenance:version
        const versionMatch = propsText.match(/(?:owl:versionInfo|provenance:version)\s+"([^"]+)"/);
        if (versionMatch) {
          metadata.version = versionMatch[1];
        }

        // Extract created date from dcterms:created
        const createdMatch = propsText.match(/dcterms:created\s+"([^"]+)"/);
        if (createdMatch) {
          metadata.created = createdMatch[1];
        }
        break;
      }
    }

    for (const statement of statements) {
      const lines = statement.split("\n").map((l) => l.trim());
      if (lines.length === 0) continue;

      const firstLine = lines[0];

      // Check if this is a class declaration
      const classMatch = firstLine.match(/^(\w+):(\w+)\s+a\s+owl:Class/);
      if (classMatch) {
        const prefix = classMatch[1];
        const classId = classMatch[2];
        const uri = metadata.namespace + classId;

        classes[classId] = {
          uri,
          type: "owl:Class",
        };

        // Parse properties from remaining lines
        const propsText = lines.slice(1).join(" ");

        // Extract labels
        const labelMatches = propsText.matchAll(
          /rdfs:label\s+"([^"]+)"(?:@(\w+(?:-\w+)?))?/g,
        );
        const labels: Array<{ value: string; lang?: string }> = [];
        for (const match of labelMatches) {
          labels.push({ value: match[1], lang: match[2] || "en" });
        }
        if (labels.length > 0) {
          classes[classId]["rdfs:label"] = labels;
        }

        // Extract comment
        const commentMatch = propsText.match(/rdfs:comment\s+"([^"]+)"/);
        if (commentMatch) {
          classes[classId]["rdfs:comment"] = commentMatch[1];
        }

        // Extract subClassOf (only if it references a class in this ontology)
        const subClassMatch = propsText.match(/rdfs:subClassOf\s+(\w+):(\w+)/);
        if (subClassMatch) {
          const subClassPrefix = subClassMatch[1];
          const subClassName = subClassMatch[2];
          // Only store if the prefix matches the ontology's prefix (internal reference)
          if (subClassPrefix === ontologyPrefix || subClassPrefix === prefix) {
            classes[classId]["rdfs:subClassOf"] = subClassName;
          }
          // External references (different prefix) are ignored for internal hierarchy
        }
        continue;
      }

      // Check if this is an object property declaration
      const objPropMatch = firstLine.match(/^(\w+):(\w+)\s+a\s+owl:ObjectProperty/);
      if (objPropMatch) {
        const prefix = objPropMatch[1];
        const propId = objPropMatch[2];
        const uri = metadata.namespace + propId;

        objectProperties[propId] = {
          uri,
          type: "owl:ObjectProperty",
        };

        // Parse properties from remaining lines
        const propsText = lines.slice(1).join(" ");

        // Extract domain (only if it references a class in this ontology)
        const domainMatch = propsText.match(/rdfs:domain\s+(\w+):(\w+)/);
        if (domainMatch) {
          const domainPrefix = domainMatch[1];
          const domainClass = domainMatch[2];
          if (domainPrefix === ontologyPrefix || domainPrefix === prefix) {
            objectProperties[propId]["rdfs:domain"] = domainClass;
          }
        }

        // Extract range (only if it references a class in this ontology)
        const rangeMatch = propsText.match(/rdfs:range\s+(\w+):(\w+)/);
        if (rangeMatch) {
          const rangePrefix = rangeMatch[1];
          const rangeClass = rangeMatch[2];
          if (rangePrefix === ontologyPrefix || rangePrefix === prefix) {
            objectProperties[propId]["rdfs:range"] = rangeClass;
          }
        }

        // Extract labels
        const labelMatches = propsText.matchAll(
          /rdfs:label\s+"([^"]+)"(?:@(\w+(?:-\w+)?))?/g,
        );
        const labels: Array<{ value: string; lang?: string }> = [];
        for (const match of labelMatches) {
          labels.push({ value: match[1], lang: match[2] || "en" });
        }
        if (labels.length > 0) {
          objectProperties[propId]["rdfs:label"] = labels;
        }

        // Extract comment
        const commentMatch = propsText.match(/rdfs:comment\s+"([^"]+)"/);
        if (commentMatch) {
          objectProperties[propId]["rdfs:comment"] = commentMatch[1];
        }
        continue;
      }

      // Check if this is a datatype property declaration
      const dtPropMatch = firstLine.match(/^(\w+):(\w+)\s+a\s+owl:DatatypeProperty/);
      if (dtPropMatch) {
        const prefix = dtPropMatch[1];
        const propId = dtPropMatch[2];
        const uri = metadata.namespace + propId;

        datatypeProperties[propId] = {
          uri,
          type: "owl:DatatypeProperty",
          "rdfs:range": "xsd:string",
        };

        // Parse properties from remaining lines
        const propsText = lines.slice(1).join(" ");

        // Extract domain (only if it references a class in this ontology)
        const domainMatch = propsText.match(/rdfs:domain\s+(\w+):(\w+)/);
        if (domainMatch) {
          const domainPrefix = domainMatch[1];
          const domainClass = domainMatch[2];
          if (domainPrefix === ontologyPrefix || domainPrefix === prefix) {
            datatypeProperties[propId]["rdfs:domain"] = domainClass;
          }
        }

        // Extract range (XSD datatypes)
        const rangeMatch = propsText.match(/rdfs:range\s+(xsd:\w+)/);
        if (rangeMatch) {
          datatypeProperties[propId]["rdfs:range"] = rangeMatch[1];
        }

        // Extract labels
        const labelMatches = propsText.matchAll(
          /rdfs:label\s+"([^"]+)"(?:@(\w+(?:-\w+)?))?/g,
        );
        const labels: Array<{ value: string; lang?: string }> = [];
        for (const match of labelMatches) {
          labels.push({ value: match[1], lang: match[2] || "en" });
        }
        if (labels.length > 0) {
          datatypeProperties[propId]["rdfs:label"] = labels;
        }

        // Extract comment
        const commentMatch = propsText.match(/rdfs:comment\s+"([^"]+)"/);
        if (commentMatch) {
          datatypeProperties[propId]["rdfs:comment"] = commentMatch[1];
        }
        continue;
      }
    }

    return {
      metadata,
      classes,
      objectProperties,
      datatypeProperties,
    };
  }

  private static extractMetadata(
    doc: Document,
    ontologyElement: Element | null,
  ): OntologyMetadata {
    const namespace =
      ontologyElement?.getAttribute("rdf:about") ||
      doc.documentElement.getAttribute("xml:base") ||
      "http://example.org/ontology#";

    const title =
      doc.querySelector("Ontology > title")?.textContent ||
      doc.querySelector("Ontology > label")?.textContent ||
      "Imported Ontology";

    const description =
      doc.querySelector("Ontology > comment")?.textContent ||
      doc.querySelector("Ontology > description")?.textContent ||
      "";

    const creator =
      doc.querySelector("Ontology > creator")?.textContent ||
      doc.querySelector("Ontology > contributor")?.textContent ||
      "";

    const version =
      doc.querySelector("Ontology > versionInfo")?.textContent || "1.0";

    return {
      name: title,
      description,
      version,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      creator,
      namespace:
        namespace.endsWith("#") || namespace.endsWith("/")
          ? namespace
          : namespace + "#",
    };
  }

  private static extractId(uri: string, namespace: string): string {
    if (uri.startsWith(namespace)) {
      return uri.substring(namespace.length);
    }
    // Extract ID from the URI (last part after # or /)
    const match = uri.match(/[#/]([^#/]+)$/);
    return match ? match[1] : uri;
  }

  private static extractLabels(
    element: Element,
  ): Array<{ value: string; lang?: string }> {
    const labels: Array<{ value: string; lang?: string }> = [];
    const labelElements = element.querySelectorAll("label");

    labelElements.forEach((label) => {
      const value = label.textContent;
      const lang = label.getAttribute("xml:lang") || "en";
      if (value) {
        labels.push({ value, lang });
      }
    });

    return labels;
  }

  private static extractComment(element: Element): string | null {
    return element.querySelector("comment")?.textContent || null;
  }

  private static extractSubClassOf(
    element: Element,
    namespace: string,
  ): string | null {
    const subClassElement = element.querySelector("subClassOf");
    if (!subClassElement) return null;

    const resource = subClassElement.getAttribute("rdf:resource");
    if (!resource) return null;

    return this.extractId(resource, namespace);
  }

  private static extractDomain(
    element: Element,
    namespace: string,
  ): string | null {
    const domainElement = element.querySelector("domain");
    if (!domainElement) return null;

    const resource = domainElement.getAttribute("rdf:resource");
    if (!resource) return null;

    return this.extractId(resource, namespace);
  }

  private static extractRange(
    element: Element,
    namespace: string,
  ): string | null {
    const rangeElement = element.querySelector("range");
    if (!rangeElement) return null;

    const resource = rangeElement.getAttribute("rdf:resource");
    if (!resource) return null;

    return this.extractId(resource, namespace);
  }
}
