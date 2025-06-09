import { useQueryClient } from "@tanstack/react-query";

import { useSocket } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { vectorSearch } from "../utils/vector-search";
import { useProgressStateStore } from "./progress";

/**
 * Custom hook for managing token cost operations
 * Provides functionality for fetching, deleting, and updating token costs
 * for AI models
 * @returns {Object} Token cost state and operations
 */

export const useVectorSearch = () => {
  // WebSocket connection for communicating with the configuration service
  const socket = useSocket();

  const addActivity = useProgressStateStore((state) => state.addActivity);

  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  // Hook for displaying user notifications
  const notify = useNotification();

  const queryClient = useQueryClient();

  const query = ({ flow, term, limit }) => {
    if (!term) return;

    if (!flow) flow = "default";
    if (!limit) limit = 10;

    /**
     * Query for fetching graph embeddings
     * Uses React Query for caching and background refetching
     */

    return queryClient.fetchQuery({
      queryKey: ["search", { flow, term, limit }],
      queryFn: () => {
        return vectorSearch(socket, flow, addActivity, removeActivity, term)
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
  };

  // Not show loading indicators, it's handled above

  // Return token cost state and operations for use in components
  return {
    // Token cost query state
    query: query,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Manual refetch function
    refetch: query.refetch,
  };
};
