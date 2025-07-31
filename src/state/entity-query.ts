import { useQuery } from "@tanstack/react-query";

import { useSocket } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";
import { getTriples } from "../utils/knowledge-graph";
import { useProgressStateStore } from "./progress";

/**
 * Custom hook for managing entity detail operations using React Query
 * Provides functionality for fetching entity details and related triples
 * @param entityUri - The URI of the entity to fetch details for
 * @param flowId - The flow ID to use for the query
 * @returns {Object} Entity detail state and operations
 */
export const useEntityDetail = (
  entityUri: string | undefined,
  flowId: string,
) => {
  // WebSocket connection for communicating with the graph service
  const socket = useSocket();

  const addActivity = useProgressStateStore((state) => state.addActivity);

  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  // Hook for displaying user notifications
  const notify = useNotification();

  /**
   * Query for fetching entity details
   * Uses React Query for caching and background refetching
   */
  const query = useQuery({
    queryKey: ["entity-detail", { entityUri, flowId }],
    queryFn: async () => {
      if (!entityUri) {
        throw new Error("Entity URI is required");
      }

      // Use the existing getTriples utility function
      return getTriples(
        socket,
        flowId,
        entityUri,
        addActivity,
        removeActivity,
      );
    },
    // Only run query if both entityUri and flowId are available
    enabled: !!entityUri && !!flowId,
  });

  // Show loading indicators for long-running operations
  useActivity(
    query.isLoading,
    entityUri ? `Knowledge graph search: ${entityUri}` : "Loading entity",
  );

  // Handle errors
  if (query.isError && query.error) {
    notify.error(query.error.toString());
  }

  // Return entity detail state and operations for use in components
  return {
    // Entity detail query state
    detail: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Manual refetch function
    refetch: query.refetch,
  };
};
