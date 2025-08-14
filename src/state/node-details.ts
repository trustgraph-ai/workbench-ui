import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useSocket } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";
import { Value } from "../api/trustgraph/Triple";
import { RDFS_LABEL } from "../utils/knowledge-graph";

/**
 * Standard URI to label mappings
 * These common URIs are mapped directly without knowledge graph queries
 */
const STANDARD_URI_LABELS: Record<string, string> = {
  "https://schema.org/subjectOf": "subject of",
  "https://schema.org/description": "description",
  "https://schema.org/copyrightHolder": "copyright holder",
  "https://schema.org/copyrightNotice": "copyright notice",
  "https://schema.org/keywords": "keywords",
  "https://schema.org/name": "Name",
  "https://schema.org/author": "author",
  "https://schema.org/publication": "publication",
  "https://schema.org/url": "url",
  "http://www.w3.org/2004/02/skos/core#definition": "Definition",
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "type",
};

/**
 * Get label for a URI, checking standard mappings first
 * @param uri - The URI to get a label for
 * @returns The label if found in standard mappings, undefined otherwise
 */
const getStandardLabel = (uri: string): string | undefined => {
  return STANDARD_URI_LABELS[uri];
};

/**
 * Custom hook for managing node details operations
 * Provides functionality for fetching triples and processing outbound relationships
 * for a selected graph node
 * @param nodeId - The ID of the selected node
 * @param flowId - The flow ID to use for the query
 * @returns {Object} Node details state and processed data
 */
export const useNodeDetails = (
  nodeId: string | undefined,
  flowId: string,
) => {
  // WebSocket connection for communicating with the graph service
  const socket = useSocket();

  // Hook for displaying user notifications
  const notify = useNotification();

  /**
   * Query for fetching outbound triples where the node is the subject
   * Uses React Query for caching and background refetching
   */
  const outboundTriplesQuery = useQuery({
    queryKey: ["node-details-outbound-triples", { nodeId, flowId }],
    queryFn: () => {
      if (!nodeId) {
        throw new Error("Node ID is required");
      }

      const subjectValue: Value = { v: nodeId, e: true };

      return socket
        .flow(flowId)
        .triplesQuery(subjectValue, undefined, undefined, 20)
        .then((triples) => {
          if (!Array.isArray(triples)) {
            console.error("Expected triples array, got:", triples);
            throw new Error("Invalid triples response");
          }
          return triples;
        })
        .catch((err) => {
          console.error("Error fetching outbound triples:", err);
          notify.error(err);
          throw err;
        });
    },
    enabled: !!nodeId && !!flowId,
  });

  /**
   * Query for fetching inbound triples where the node is the object
   * Uses React Query for caching and background refetching
   */
  const inboundTriplesQuery = useQuery({
    queryKey: ["node-details-inbound-triples", { nodeId, flowId }],
    queryFn: () => {
      if (!nodeId) {
        throw new Error("Node ID is required");
      }

      const objectValue: Value = { v: nodeId, e: true };

      return socket
        .flow(flowId)
        .triplesQuery(undefined, undefined, objectValue, 20)
        .then((triples) => {
          if (!Array.isArray(triples)) {
            console.error("Expected triples array, got:", triples);
            throw new Error("Invalid triples response");
          }
          return triples;
        })
        .catch((err) => {
          console.error("Error fetching inbound triples:", err);
          notify.error(err);
          throw err;
        });
    },
    enabled: !!nodeId && !!flowId,
  });

  /**
   * Query for fetching properties where the node is the subject and object is a literal
   * Uses React Query for caching and background refetching
   */
  const propertiesQuery = useQuery({
    queryKey: ["node-details-properties", { nodeId, flowId }],
    queryFn: () => {
      if (!nodeId) {
        throw new Error("Node ID is required");
      }

      const subjectValue: Value = { v: nodeId, e: true };

      return socket
        .flow(flowId)
        .triplesQuery(subjectValue, undefined, undefined, 50) // More limit for properties
        .then((triples) => {
          if (!Array.isArray(triples)) {
            console.error("Expected triples array, got:", triples);
            throw new Error("Invalid triples response");
          }
          // Filter for properties (where o.e === false)
          return triples.filter((triple) => triple.o && triple.o.e === false);
        })
        .catch((err) => {
          console.error("Error fetching properties:", err);
          notify.error(err);
          throw err;
        });
    },
    enabled: !!nodeId && !!flowId,
  });

  /**
   * Process outbound triples to extract navigable relationships
   * Filters for entity relationships (o.e === true) and removes duplicates
   */
  const outboundRelationships = useMemo(() => {
    if (!outboundTriplesQuery.data) return [];

    // Filter for entity relationships and extract unique predicates
    const uniqueRelationships = new Set<string>();

    outboundTriplesQuery.data.forEach((triple) => {
      // Check if object is an entity (o.e === true)
      if (triple.o && triple.o.e === true && triple.p && triple.p.v) {
        uniqueRelationships.add(triple.p.v);
      }
    });

    // Convert Set to array
    return Array.from(uniqueRelationships);
  }, [outboundTriplesQuery.data]);

  /**
   * Process inbound triples to extract navigable relationships
   * Filters for entity relationships (s.e === true) and removes duplicates
   */
  const inboundRelationships = useMemo(() => {
    if (!inboundTriplesQuery.data) return [];

    // Filter for entity relationships and extract unique predicates
    const uniqueRelationships = new Set<string>();

    inboundTriplesQuery.data.forEach((triple) => {
      // Check if subject is an entity (s.e === true)
      if (triple.s && triple.s.e === true && triple.p && triple.p.v) {
        uniqueRelationships.add(triple.p.v);
      }
    });

    // Convert Set to array
    return Array.from(uniqueRelationships);
  }, [inboundTriplesQuery.data]);

  /**
   * Process properties to extract unique property URIs
   * Properties are triples where o.e === false (literals)
   */
  const propertyURIs = useMemo(() => {
    if (!propertiesQuery.data) return [];

    // Extract unique property predicates
    const uniqueProperties = new Set<string>();

    propertiesQuery.data.forEach((triple) => {
      if (triple.p && triple.p.v) {
        uniqueProperties.add(triple.p.v);
      }
    });

    // Convert Set to array
    return Array.from(uniqueProperties);
  }, [propertiesQuery.data]);

  /**
   * Fetch labels for outbound relationship URIs
   * Uses dependent query that only runs when outbound relationships are available
   */
  const outboundLabelsQuery = useQuery({
    queryKey: [
      "relationship-labels-outbound",
      { nodeId, flowId, relationships: outboundRelationships },
    ],
    queryFn: async () => {
      if (!outboundRelationships.length) return {};

      const labelMap: Record<string, string> = {};

      // Fetch labels for each relationship URI
      await Promise.all(
        outboundRelationships.map(async (relationshipURI) => {
          // Check standard mappings first
          const standardLabel = getStandardLabel(relationshipURI);
          if (standardLabel) {
            labelMap[relationshipURI] = standardLabel;
            return;
          }

          // If not in standard mappings, query the knowledge graph
          try {
            const subjectValue: Value = { v: relationshipURI, e: true };
            const predicateValue: Value = { v: RDFS_LABEL, e: true };

            const labelTriples = await socket
              .flow(flowId)
              .triplesQuery(subjectValue, predicateValue, undefined, 1);

            // Extract label from the first result, or use URI as fallback
            if (
              labelTriples &&
              labelTriples.length > 0 &&
              labelTriples[0].o
            ) {
              labelMap[relationshipURI] = labelTriples[0].o.v;
            } else {
              labelMap[relationshipURI] = relationshipURI;
            }
          } catch (error) {
            console.warn(
              `Failed to fetch label for ${relationshipURI}:`,
              error,
            );
            labelMap[relationshipURI] = relationshipURI;
          }
        }),
      );

      return labelMap;
    },
    enabled: !!nodeId && !!flowId && outboundRelationships.length > 0,
  });

  /**
   * Fetch labels for inbound relationship URIs
   * Uses dependent query that only runs when inbound relationships are available
   */
  const inboundLabelsQuery = useQuery({
    queryKey: [
      "relationship-labels-inbound",
      { nodeId, flowId, relationships: inboundRelationships },
    ],
    queryFn: async () => {
      if (!inboundRelationships.length) return {};

      const labelMap: Record<string, string> = {};

      // Fetch labels for each relationship URI
      await Promise.all(
        inboundRelationships.map(async (relationshipURI) => {
          // Check standard mappings first
          const standardLabel = getStandardLabel(relationshipURI);
          if (standardLabel) {
            labelMap[relationshipURI] = standardLabel;
            return;
          }

          // If not in standard mappings, query the knowledge graph
          try {
            const subjectValue: Value = { v: relationshipURI, e: true };
            const predicateValue: Value = { v: RDFS_LABEL, e: true };

            const labelTriples = await socket
              .flow(flowId)
              .triplesQuery(subjectValue, predicateValue, undefined, 1);

            // Extract label from the first result, or use URI as fallback
            if (
              labelTriples &&
              labelTriples.length > 0 &&
              labelTriples[0].o
            ) {
              labelMap[relationshipURI] = labelTriples[0].o.v;
            } else {
              labelMap[relationshipURI] = relationshipURI;
            }
          } catch (error) {
            console.warn(
              `Failed to fetch label for ${relationshipURI}:`,
              error,
            );
            labelMap[relationshipURI] = relationshipURI;
          }
        }),
      );

      return labelMap;
    },
    enabled: !!nodeId && !!flowId && inboundRelationships.length > 0,
  });

  /**
   * Fetch labels for property URIs
   * Uses dependent query that only runs when properties are available
   */
  const propertyLabelsQuery = useQuery({
    queryKey: [
      "property-labels",
      { nodeId, flowId, properties: propertyURIs },
    ],
    queryFn: async () => {
      if (!propertyURIs.length) return {};

      const labelMap: Record<string, string> = {};

      // Fetch labels for each property URI
      await Promise.all(
        propertyURIs.map(async (propertyURI) => {
          // Check standard mappings first
          const standardLabel = getStandardLabel(propertyURI);
          if (standardLabel) {
            labelMap[propertyURI] = standardLabel;
            return;
          }

          // If not in standard mappings, query the knowledge graph
          try {
            const subjectValue: Value = { v: propertyURI, e: true };
            const predicateValue: Value = { v: RDFS_LABEL, e: true };

            const labelTriples = await socket
              .flow(flowId)
              .triplesQuery(subjectValue, predicateValue, undefined, 1);

            // Extract label from the first result, or use URI as fallback
            if (
              labelTriples &&
              labelTriples.length > 0 &&
              labelTriples[0].o
            ) {
              labelMap[propertyURI] = labelTriples[0].o.v;
            } else {
              labelMap[propertyURI] = propertyURI;
            }
          } catch (error) {
            console.warn(`Failed to fetch label for ${propertyURI}:`, error);
            labelMap[propertyURI] = propertyURI;
          }
        }),
      );

      return labelMap;
    },
    enabled: !!nodeId && !!flowId && propertyURIs.length > 0,
  });

  /**
   * Combine relationship URIs with their labels
   */
  const outboundRelationshipsWithLabels = useMemo(() => {
    if (!outboundLabelsQuery.data) {
      return outboundRelationships.map((uri) => ({ uri, label: uri }));
    }

    return outboundRelationships.map((uri) => ({
      uri,
      label: outboundLabelsQuery.data[uri] || uri,
    }));
  }, [outboundRelationships, outboundLabelsQuery.data]);

  const inboundRelationshipsWithLabels = useMemo(() => {
    if (!inboundLabelsQuery.data) {
      return inboundRelationships.map((uri) => ({ uri, label: uri }));
    }

    return inboundRelationships.map((uri) => ({
      uri,
      label: inboundLabelsQuery.data[uri] || uri,
    }));
  }, [inboundRelationships, inboundLabelsQuery.data]);

  /**
   * Combine properties with their labels and values
   * Creates array of {predicate: {uri, label}, value} objects
   * Excludes label properties since they're already displayed at the top
   */
  const propertiesWithLabels = useMemo(() => {
    if (!propertiesQuery.data) return [];

    return propertiesQuery.data
      .filter((triple) => {
        // Exclude label properties (RDFS_LABEL) since node label is already shown
        return triple.p?.v !== RDFS_LABEL;
      })
      .map((triple) => ({
        predicate: {
          uri: triple.p?.v || "",
          label:
            propertyLabelsQuery.data?.[triple.p?.v || ""] ||
            triple.p?.v ||
            "",
        },
        value: triple.o?.v || "",
      }));
  }, [propertiesQuery.data, propertyLabelsQuery.data]);

  // Show loading indicators for long-running operations
  useActivity(
    outboundTriplesQuery.isLoading ||
      inboundTriplesQuery.isLoading ||
      propertiesQuery.isLoading ||
      outboundLabelsQuery.isLoading ||
      inboundLabelsQuery.isLoading ||
      propertyLabelsQuery.isLoading,
    "Loading node details",
  );

  // Return node details state and operations for use in components
  return {
    // Raw triples data
    outboundTriples: outboundTriplesQuery.data,
    inboundTriples: inboundTriplesQuery.data,
    properties: propertiesQuery.data,

    // Loading states
    triplesLoading:
      outboundTriplesQuery.isLoading || inboundTriplesQuery.isLoading,
    propertiesLoading: propertiesQuery.isLoading,
    labelsLoading:
      outboundLabelsQuery.isLoading ||
      inboundLabelsQuery.isLoading ||
      propertyLabelsQuery.isLoading,
    isLoading:
      outboundTriplesQuery.isLoading ||
      inboundTriplesQuery.isLoading ||
      propertiesQuery.isLoading ||
      outboundLabelsQuery.isLoading ||
      inboundLabelsQuery.isLoading ||
      propertyLabelsQuery.isLoading,

    outboundTriplesLoading: outboundTriplesQuery.isLoading,
    inboundTriplesLoading: inboundTriplesQuery.isLoading,
    propertiesQueryLoading: propertiesQuery.isLoading,
    outboundLabelsLoading: outboundLabelsQuery.isLoading,
    inboundLabelsLoading: inboundLabelsQuery.isLoading,
    propertyLabelsLoading: propertyLabelsQuery.isLoading,

    // Error states
    triplesError: outboundTriplesQuery.isError || inboundTriplesQuery.isError,
    propertiesError: propertiesQuery.isError,
    labelsError:
      outboundLabelsQuery.isError ||
      inboundLabelsQuery.isError ||
      propertyLabelsQuery.isError,
    hasError:
      outboundTriplesQuery.isError ||
      inboundTriplesQuery.isError ||
      propertiesQuery.isError ||
      outboundLabelsQuery.isError ||
      inboundLabelsQuery.isError ||
      propertyLabelsQuery.isError,

    outboundTriplesError: outboundTriplesQuery.isError,
    inboundTriplesError: inboundTriplesQuery.isError,
    outboundLabelsError: outboundLabelsQuery.isError,
    inboundLabelsError: inboundLabelsQuery.isError,

    // Error messages
    outboundTriplesErrorMessage: outboundTriplesQuery.error,
    inboundTriplesErrorMessage: inboundTriplesQuery.error,
    propertiesErrorMessage: propertiesQuery.error,
    outboundLabelsErrorMessage: outboundLabelsQuery.error,
    inboundLabelsErrorMessage: inboundLabelsQuery.error,
    propertyLabelsErrorMessage: propertyLabelsQuery.error,

    // Processed data - URIs only (for backward compatibility)
    outboundRelationships,
    inboundRelationships,
    propertyURIs,

    // Processed data - with labels
    outboundRelationshipsWithLabels,
    inboundRelationshipsWithLabels,
    propertiesWithLabels,

    // Manual refetch functions
    refetchOutbound: () => {
      outboundTriplesQuery.refetch();
      outboundLabelsQuery.refetch();
    },
    refetchInbound: () => {
      inboundTriplesQuery.refetch();
      inboundLabelsQuery.refetch();
    },
    refetchProperties: () => {
      propertiesQuery.refetch();
      propertyLabelsQuery.refetch();
    },
    refetch: () => {
      outboundTriplesQuery.refetch();
      inboundTriplesQuery.refetch();
      propertiesQuery.refetch();
      outboundLabelsQuery.refetch();
      inboundLabelsQuery.refetch();
      propertyLabelsQuery.refetch();
    },
  };
};
