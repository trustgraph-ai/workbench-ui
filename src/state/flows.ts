import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { useSocket, useConnectionState } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";

/**
 * Custom hook for managing flow operations
 * Provides functionality for fetching, deleting, and creating flows
 * @returns {Object} Flow state and operations
 */
export const useFlows = () => {
  // WebSocket connection for communicating with the flows service
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
   * Query for fetching all flows
   * Uses React Query for caching and background refetching
   */
  const flowsQuery = useQuery({
    queryKey: ["flows"],
    enabled: isSocketReady,
    queryFn: () => {
      return socket
        .flows()
        .getFlows()
        .then((flows) =>
          Promise.all(
            flows.map((flowId) =>
              socket
                .flows()
                .getFlow(flowId)
                .then((flow) => {
                  return { ...flow, id: flowId };
                }),
            ),
          ),
        );
    },
  });

  /**
   * Query for fetching all flow classes
   * Uses React Query for caching and background refetching
   */
  const flowClassesQuery = useQuery({
    queryKey: ["flow-classes"],
    enabled: isSocketReady,
    queryFn: () => {
      return socket
        .flows()
        .getFlowClasses()
        .then((cls) =>
          Promise.all(
            cls.map((id) =>
              socket
                .flows()
                .getFlowClass(id)
                .then((cls) => [id, cls]),
            ),
          ),
        );
    },
  });

  /**
   * Mutation for starting a new flow for processing workflows
   */
  const startFlowMutation = useMutation({
    mutationFn: ({ id, flowClass, description, onSuccess }) => {
      return socket
        .flows()
        .startFlow(id, flowClass, description)
        .then(() => {
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
      // Invalidate flows cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["flows"] });
      notify.success("Started flow");
    },
  });

  /**
   * Mutation for deleting multiple flows
   * Executes parallel deletion requests and handles success/error states
   */
  const stopFlowMutation = useMutation({
    mutationFn: ({ ids, onSuccess }) => {
      console.log("Selected", ids);
      // Execute deletion requests in parallel for all flows
      return Promise.all(ids.map((id) => socket.flows().stopFlow(id))).then(
        () => {
          // Execute success callback if provided
          if (onSuccess) onSuccess();
        },
      );
    },
    onError: (err) => {
      console.log("Error:", err);
      // Show error notification to user
      notify.error(err.toString());
    },
    onSuccess: () => {
      // Invalidate flows cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["flows"] });
      // Show success notification
      notify.success("Successful deletion");
    },
  });

  // Show loading indicators for long-running operations
  useActivity(flowsQuery.isLoading, "Loading flows");
  useActivity(flowClassesQuery.isLoading, "Loading flow classes");
  useActivity(startFlowMutation.isPending, "Starting flow");
  useActivity(stopFlowMutation.isPending, "Stopping flows");

  // Return flows state and operations for use in components
  return {
    // Flow data and query state
    flows: flowsQuery.data,
    isLoading: flowsQuery.isLoading,
    isError: flowsQuery.isError,
    error: flowsQuery.error,

    // Flow data and query state
    flowClasses: flowClassesQuery.data,
    isFlowClassesLoading: flowClassesQuery.isLoading,
    isFlowClassesError: flowClassesQuery.isError,
    flowClassesError: flowClassesQuery.error,

    // Flow start operations
    startFlow: startFlowMutation.mutate,
    isStarting: startFlowMutation.isPending,
    startError: startFlowMutation.error,

    // Flow stop operations
    stopFlows: stopFlowMutation.mutate,
    isStopping: stopFlowMutation.isPending,
    stopError: stopFlowMutation.error,

    // Manual refetch function
    refetch: flowsQuery.refetch,
  };
};
