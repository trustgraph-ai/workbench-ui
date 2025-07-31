import { useQuery } from "@tanstack/react-query";

import { useSocket } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";

/**
 * Custom hook for managing token cost operations
 * Provides functionality for fetching, deleting, and updating token costs
 * for AI models
 * @returns {Object} Token cost state and operations
 */
export const useGraphEmbeddings = ({ flow, vecs, limit }) => {
  // WebSocket connection for communicating with the configuration service
  const socket = useSocket();

  // Hook for displaying user notifications
  const notify = useNotification();

  if (!flow) flow = "default";

  /**
   * Query for fetching graph embeddings
   * Uses React Query for caching and background refetching
   */
  const query = useQuery({
    queryKey: ["graph-embeddings", { vecs, limit }],
    queryFn: () => {
      return socket
        .flow(flow)
        .graphEmbeddingsQuery(vecs, limit)
        .then((x) => {
          if (x["error"]) {
            console.log("Error:", x);
            throw x.error.message;
          }
          return x;
        })
        .catch((err) => {
          console.log("Error:", err);
          notify.error(err);
        });
    },
  });

  // Show loading indicators for long-running operations
  useActivity(query.isLoading, "Loading graph embeddings");

  // Return token cost state and operations for use in components
  return {
    // Token cost query state
    graphEmbeddings: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Manual refetch function
    refetch: query.refetch,
  };
};
