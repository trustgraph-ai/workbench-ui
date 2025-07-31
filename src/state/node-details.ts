import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useSocket } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";
import { Value } from "../api/trustgraph/Triple";

/**
 * Custom hook for managing node details operations
 * Provides functionality for fetching triples and processing outbound relationships
 * for a selected graph node
 * @param nodeId - The ID of the selected node
 * @param flowId - The flow ID to use for the query
 * @returns {Object} Node details state and processed data
 */
export const useNodeDetails = (nodeId: string | undefined, flowId: string) => {
  // WebSocket connection for communicating with the graph service
  const socket = useSocket();

  // Hook for displaying user notifications
  const notify = useNotification();

  /**
   * Query for fetching triples where the node is the subject
   * Uses React Query for caching and background refetching
   */
  const triplesQuery = useQuery({
    queryKey: ["node-details-triples", { nodeId, flowId }],
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
          console.error("Error fetching node triples:", err);
          notify.error(err);
          throw err;
        });
    },
    enabled: !!nodeId && !!flowId,
  });

  // Show loading indicators for long-running operations
  useActivity(triplesQuery.isLoading, "Loading node details");

  /**
   * Process triples to extract outbound navigable relationships
   * Filters for entity relationships (o.e === true) and removes duplicates
   */
  const outboundRelationships = useMemo(() => {
    if (!triplesQuery.data) return [];
    
    // Filter for entity relationships and extract unique predicates
    const uniqueRelationships = new Set<string>();
    
    triplesQuery.data.forEach(triple => {
      // Check if object is an entity (o.e === true)
      if (triple.o && triple.o.e === true && triple.p && triple.p.v) {
        uniqueRelationships.add(triple.p.v);
      }
    });
    
    // Convert Set to array
    return Array.from(uniqueRelationships);
  }, [triplesQuery.data]);

  // Return node details state and operations for use in components
  return {
    // Raw triples data
    triples: triplesQuery.data,
    triplesLoading: triplesQuery.isLoading,
    triplesError: triplesQuery.isError,
    triplesErrorMessage: triplesQuery.error,

    // Processed data
    outboundRelationships,

    // Manual refetch function
    refetch: triplesQuery.refetch,
  };
};