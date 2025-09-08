// React Query hooks for data fetching and mutation management
import { useMutation } from "@tanstack/react-query";

// TrustGraph socket connection for API communication
import { useSocket, useConnectionState } from "../api/trustgraph/socket";
// Notification system for user feedback
import { useNotification } from "./notify";
// Activity tracking for loading states
import { useActivity } from "./activity";
// Session state for flow ID
import { useSessionStore } from "./session";
// Settings for user and collection
import { useSettings } from "./settings";

/**
 * Custom hook for managing GraphQL objects queries
 * Provides functionality for executing GraphQL queries against structured data objects
 */
export const useObjectsQuery = () => {
  // Socket connection for API calls
  const socket = useSocket();
  const connectionState = useConnectionState();
  // Notification system for user feedback
  const notify = useNotification();
  // Session state for current flow ID
  const flowId = useSessionStore((state) => state.flowId);
  // Settings for default collection
  const { settings } = useSettings();

  // Only enable operations when socket is connected and ready
  const isSocketReady =
    connectionState?.status === "authenticated" ||
    connectionState?.status === "unauthenticated";

  // Mutation for executing GraphQL objects queries
  const objectsQueryMutation = useMutation({
    mutationFn: async ({
      query,
      collection,
      variables,
      operationName,
    }: {
      query: string;
      collection?: string;
      variables?: Record<string, unknown>;
      operationName?: string;
    }) => {
      if (!isSocketReady) {
        throw new Error("Socket connection not ready");
      }

      return socket
        .flow(flowId)
        .objectsQuery(
          query,
          collection || settings.collection,
          variables,
          operationName,
        );
    },
    onError: (err) => {
      console.log("Objects query error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : err?.toString() || "Unknown error";
      notify.error(`GraphQL query failed: ${errorMessage}`);
    },
    onSuccess: () => {
      notify.success("GraphQL query executed successfully");
    },
  });

  // Show loading indicator for query operations
  useActivity(objectsQueryMutation.isPending, "Executing GraphQL query");

  // Return the public API for the hook
  return {
    // Query execution
    executeQuery: objectsQueryMutation.mutate,
    executeQueryAsync: objectsQueryMutation.mutateAsync,

    // Query state
    isExecuting: objectsQueryMutation.isPending,
    error: objectsQueryMutation.error,
    data: objectsQueryMutation.data,

    // Reset function to clear previous results
    reset: objectsQueryMutation.reset,

    // Socket readiness
    isReady: isSocketReady,
  };
};
