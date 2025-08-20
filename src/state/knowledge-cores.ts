import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { useSocket, useConnectionState } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";

/**
 * Custom hook for managing knowledge core operations
 * Provides functionality for fetching, deleting, down/uploading cores
 * @returns {Object} Knowledge core state and operations
 */
export const useKnowledgeCores = () => {
  // WebSocket connection for communicating with the knowledge service
  const socket = useSocket();
  const connectionState = useConnectionState();

  // React Query client for cache management and invalidation
  const queryClient = useQueryClient();

  // Hook for displaying user notifications
  const notify = useNotification();

  // Only enable queries when socket is connected and ready
  const isSocketReady =
    connectionState?.status === "authenticated" ||
    connectionState?.status === "unauthenticated";

  /**
   * Query for fetching all knowledge cores
   * Uses React Query for caching and background refetching
   */
  const query = useQuery({
    queryKey: ["knowledge-cores"],
    enabled: isSocketReady,
    queryFn: () => {
      return socket
        .knowledge()
        .getKnowledgeCores()
        .then((cores) =>
          cores.map((x) => {
            return { id: x };
          }),
        );
    },
  });

  /**
   * Mutation for deleting multiple knowledge cores
   * Executes parallel deletion requests and handles success/error states
   */
  const deleteKnowledgeCoresMutation = useMutation({
    mutationFn: ({ ids, onSuccess }) => {
      const user = "trustgraph";

      // Execute deletion requests in parallel for all knowledge cores
      return Promise.all(
        ids.map((id) => socket.knowledge().deleteKgCore(id, user)),
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
      // Invalidate documents cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["knowledge-cores"] });
      // Show success notification
      notify.success("Successful deletion");
    },
  });

  /**
   * Mutation for loading multiple knowledge cores
   * Executes parallel load requests with specified flow
   */
  const loadKnowledgeCoresMutation = useMutation({
    mutationFn: ({ ids, flow, onSuccess }) => {
      // Execute load requests in parallel for all knowledge cores
      return Promise.all(
        ids.map((id) => socket.knowledge().loadKgCore(id, flow)),
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
      // Show success notification
      notify.success("Knowledge cores loaded successfully");
    },
  });

  // Show loading indicators for long-running operations
  useActivity(query.isLoading, "Loading knowledge cores");

  // Return knowledge core state and operations for use in components
  return {
    // Knowledge cores
    knowledgeCores: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Knowledge core deletion operations
    deleteKnowledgeCores: deleteKnowledgeCoresMutation.mutate,
    isDeleting: deleteKnowledgeCoresMutation.isPending,
    deleteError: deleteKnowledgeCoresMutation.error,

    // Knowledge core loading operations
    loadKnowledgeCores: loadKnowledgeCoresMutation.mutate,
    isLoadingCores: loadKnowledgeCoresMutation.isPending,
    loadError: loadKnowledgeCoresMutation.error,

    // Manual refetch function
    refetch: query.refetch,
  };
};
