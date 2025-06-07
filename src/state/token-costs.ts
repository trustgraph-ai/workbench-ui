import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { useSocket } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";

/**
 * Custom hook for managing document library operations
 * Provides functionality for fetching, deleting, and submitting documents
 * @returns {Object} Library state and operations
 */
export const useTokenCosts = () => {
  // WebSocket connection for communicating with the configuration service
  const socket = useSocket();

  // React Query client for cache management and invalidation
  const queryClient = useQueryClient();

  // Hook for displaying user notifications
  const notify = useNotification();

  /**
   * Query for fetching all token costs
   * Uses React Query for caching and background refetching
   */
  const query = useQuery({
    queryKey: ["documents"],
    queryFn: () => {
      return socket.config().getTokenCosts();
    },
  });

  /**
   * Mutation for deleting multiple documents
   * Executes parallel deletion requests and handles success/error states
   */
  const deleteTokenCostsMutation = useMutation({
    mutationFn: ({ ids, onSuccess }) => {
      // Execute deletion requests in parallel for all document IDs
      return Promise.all(
        ids.map((id) => socket.librarian().removeDocument(id)),
      ).then(() => {
        // Execute success callback if provided
        if (onSuccess) onSuccess();
      });
    },
    onError: (err) => {
      console.log("Error:", err);
      // Show error notification to user
      notify.error(err.toString());
    },
    onSuccess: () => {
      // Invalidate cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["token-costs"] });
      // Show success notification
      notify.success("Successful deletion");
    },
  });

  /**
   * Mutation for updating token cost
   */
  const updateTokenCostMutation = useMutation({
    mutationFn: ({ ids, flow, tags, onSuccess }) => {
      // FIXME: Needs to be properly implemented.
      // Hardcoded values that should be configurable
      const user = "trustgraph";
      const collection = "default";

      // Create processing entries for each document
      return Promise.all(
        ids.map((id) => {
          // Generate unique processing ID for each document
          const proc_id = uuidv4();
          return socket
            .librarian()
            .addProcessing(proc_id, id, flow, user, collection, tags);
        }),
      ).then(() => {
        // Execute success callback if provided
        if (onSuccess) onSuccess();
      });
    },
    onError: (err) => {
      console.log("Error:", err);
      // Show error notification to user
      notify.error(err.toString());
    },
    onSuccess: () => {
      // Invalidate cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["token-costs"] });
      notify.success("Successful submission");
    },
  });

  // Show loading indicators for long-running operations
  useActivity(queryClient.isLoading, "Loading token costs");
  useActivity(deleteTokenCostsMutation.isPending, "Deleting token costs");
  useActivity(updateTokenCostMutation.isPending, "Updating token costs");

  // Return library state and operations for use in components
  return {
    // Token cost query state
    tokenCosts: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Token cost deletion operations
    deleteTokenCosts: deleteTokenCostsMutation.mutate,
    isDeleting: deleteTokenCostsMutation.isPending,
    deleteError: deleteTokenCostsMutation.error,

    // Token cost update operations
    updateTokenCosts: updateTokenCostMutation.mutate,
    isSubmitting: updateTokenCostMutation.isPending,
    submitError: updateTokenCostMutation.error,

    // Manual refetch function
    refetch: query.refetch,
  };
};
