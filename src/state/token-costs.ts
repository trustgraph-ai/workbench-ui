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
    queryKey: ["token-costs"],
    queryFn: () => {
      return socket
        .config()
        .getTokenCosts()
        .then((x) => {
          if (x["error"]) {
            console.log("Error:", x);
            throw x.error.message;
          }
          return x;
        });
    },
  });

  /**
   * Mutation for deleting multiple documents
   * Executes parallel deletion requests and handles success/error states
   */
  const deleteTokenCostsMutation = useMutation({
    mutationFn: ({ model, onSuccess }) => {
      // Execute deletion requests in parallel for all document IDs
      return socket
        .config()
        .deleteConfig([
          {
            type: "token-costs",
            key: model,
          },
        ])
        .then((x) => {
          // Execute success callback if provided
          if (x["error"]) {
            console.log("Error:", x);
            throw x.error.message;
          }
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
    mutationFn: ({ model, input_price, output_price, onSuccess }) => {
      const tokenCost = {
        input_price: input_price / 1000000,
        output_price: output_price / 1000000,
      };
      // Create processing entries for each document
      return socket
        .config()
        .putConfig([
          {
            type: "token-costs",
            key: model,
            value: JSON.stringify(tokenCost),
          },
        ])
        .then((x) => {
          // Execute success callback if provided
          if (x["error"]) {
            console.log("Error:", x);
            throw x.error.message;
          }
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
      notify.success("Token costs updated");
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
    updateTokenCost: updateTokenCostMutation.mutate,
    isSubmitting: updateTokenCostMutation.isPending,
    submitError: updateTokenCostMutation.error,

    // Manual refetch function
    refetch: query.refetch,
  };
};
