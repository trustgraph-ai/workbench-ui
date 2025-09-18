import { Ontology, OWLClass, OWLObjectProperty, OWLDatatypeProperty, OntologyMetadata } from "../../state/ontologies";

export type ImportFormat = "owl" | "rdf" | "turtle";

export interface ImportOptions {
  format: ImportFormat;
  overwriteExisting?: boolean;
  mergeWithExisting?: boolean;
}

export class OntologyImporter {
  static async import(content: string, options: ImportOptions): Promise<Ontology> {
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
    if (trimmed.startsWith("<?xml") || trimmed.includes("<rdf:RDF") || trimmed.includes("<owl:Ontology")) {
      // Distinguish between OWL and RDF
      if (trimmed.includes("<owl:Ontology") || trimmed.includes("owl:Class")) {
        return "owl";
      }
      return "rdf";
    }

    // Check for Turtle
    if (trimmed.includes("@prefix") || trimmed.includes("@base") ||
        (trimmed.includes("a owl:") || trimmed.includes("a rdfs:"))) {
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
      const uri = classEl.getAttribute("rdf:about") || classEl.getAttribute("rdf:ID") || "";
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
      const uri = propEl.getAttribute("rdf:about") || propEl.getAttribute("rdf:ID") || "";
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
      const uri = propEl.getAttribute("rdf:about") || propEl.getAttribute("rdf:ID") || "";
      if (!uri) return;

      const propId = this.extractId(uri, metadata.namespace);
      const labels = this.extractLabels(propEl);
      const comment = this.extractComment(propEl);
      const domain = this.extractDomain(propEl, metadata.namespace);
      const range = propEl.querySelector("range")?.getAttribute("rdf:resource") || "xsd:string";

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
    const namespaceMatch = content.match(/@base\s+<([^>]+)>/);
    if (namespaceMatch) {
      metadata.namespace = namespaceMatch[1];
    } else {
      const prefixMatch = content.match(/@prefix\s+:\s+<([^>]+)>/);
      if (prefixMatch) {
        metadata.namespace = prefixMatch[1];
      }
    }

    // Simple Turtle parser - this is a basic implementation
    // In production, you'd want to use a proper Turtle parser library

    // Extract classes (simplified pattern matching)
    const classPattern = /:(\w+)\s+a\s+owl:Class/g;
    let classMatch;
    while ((classMatch = classPattern.exec(content)) !== null) {
      const classId = classMatch[1];
      const uri = metadata.namespace + classId;

      classes[classId] = {
        uri,
        type: "owl:Class",
      };

      // Try to find label
      const labelPattern = new RegExp(`:${classId}\\s+rdfs:label\\s+"([^"]+)"`, 'g');
      const labelMatch = labelPattern.exec(content);
      if (labelMatch) {
        classes[classId]["rdfs:label"] = [{ value: labelMatch[1], lang: "en" }];
      }

      // Try to find comment
      const commentPattern = new RegExp(`:${classId}\\s+rdfs:comment\\s+"([^"]+)"`, 'g');
      const commentMatch = commentPattern.exec(content);
      if (commentMatch) {
        classes[classId]["rdfs:comment"] = commentMatch[1];
      }
    }

    // Extract object properties
    const objPropPattern = /:(\w+)\s+a\s+owl:ObjectProperty/g;
    let objPropMatch;
    while ((objPropMatch = objPropPattern.exec(content)) !== null) {
      const propId = objPropMatch[1];
      const uri = metadata.namespace + propId;

      objectProperties[propId] = {
        uri,
        type: "owl:ObjectProperty",
      };

      // Try to find domain and range
      const domainPattern = new RegExp(`:${propId}\\s+rdfs:domain\\s+:?(\\w+)`, 'g');
      const domainMatch = domainPattern.exec(content);
      if (domainMatch) {
        objectProperties[propId]["rdfs:domain"] = domainMatch[1];
      }

      const rangePattern = new RegExp(`:${propId}\\s+rdfs:range\\s+:?(\\w+)`, 'g');
      const rangeMatch = rangePattern.exec(content);
      if (rangeMatch) {
        objectProperties[propId]["rdfs:range"] = rangeMatch[1];
      }
    }

    // Extract datatype properties
    const dtPropPattern = /:(\w+)\s+a\s+owl:DatatypeProperty/g;
    let dtPropMatch;
    while ((dtPropMatch = dtPropPattern.exec(content)) !== null) {
      const propId = dtPropMatch[1];
      const uri = metadata.namespace + propId;

      datatypeProperties[propId] = {
        uri,
        type: "owl:DatatypeProperty",
        "rdfs:range": "xsd:string",
      };
    }

    return {
      metadata,
      classes,
      objectProperties,
      datatypeProperties,
    };
  }

  private static extractMetadata(doc: Document, ontologyElement: Element | null): OntologyMetadata {
    const namespace = ontologyElement?.getAttribute("rdf:about") ||
                     doc.documentElement.getAttribute("xml:base") ||
                     "http://example.org/ontology#";

    const title = doc.querySelector("Ontology > title")?.textContent ||
                 doc.querySelector("Ontology > label")?.textContent ||
                 "Imported Ontology";

    const description = doc.querySelector("Ontology > comment")?.textContent ||
                       doc.querySelector("Ontology > description")?.textContent ||
                       "";

    const creator = doc.querySelector("Ontology > creator")?.textContent ||
                   doc.querySelector("Ontology > contributor")?.textContent ||
                   "";

    const version = doc.querySelector("Ontology > versionInfo")?.textContent || "1.0";

    return {
      name: title,
      description,
      version,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      creator,
      namespace: namespace.endsWith("#") || namespace.endsWith("/") ? namespace : namespace + "#",
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

  private static extractLabels(element: Element): Array<{ value: string; lang?: string }> {
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

  private static extractSubClassOf(element: Element, namespace: string): string | null {
    const subClassElement = element.querySelector("subClassOf");
    if (!subClassElement) return null;

    const resource = subClassElement.getAttribute("rdf:resource");
    if (!resource) return null;

    return this.extractId(resource, namespace);
  }

  private static extractDomain(element: Element, namespace: string): string | null {
    const domainElement = element.querySelector("domain");
    if (!domainElement) return null;

    const resource = domainElement.getAttribute("rdf:resource");
    if (!resource) return null;

    return this.extractId(resource, namespace);
  }

  private static extractRange(element: Element, namespace: string): string | null {
    const rangeElement = element.querySelector("range");
    if (!rangeElement) return null;

    const resource = rangeElement.getAttribute("rdf:resource");
    if (!resource) return null;

    return this.extractId(resource, namespace);
  }
}