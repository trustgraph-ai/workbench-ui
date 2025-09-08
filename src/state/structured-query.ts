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

/**
 * Custom hook for managing structured query operations
 * Provides functionality for executing natural language questions against structured data
 * Combines NLP query conversion and GraphQL execution in a single operation
 */
export const useStructuredQuery = () => {
  // Socket connection for API calls
  const socket = useSocket();
  const connectionState = useConnectionState();
  // Notification system for user feedback
  const notify = useNotification();
  // Session state for current flow ID
  const flowId = useSessionStore((state) => state.flowId);

  // Only enable operations when socket is connected and ready
  const isSocketReady =
    connectionState?.status === "authenticated" ||
    connectionState?.status === "unauthenticated";

  // Mutation for executing structured queries from natural language
  const structuredQueryMutation = useMutation({
    mutationFn: async ({ question }: { question: string }) => {
      if (!isSocketReady) {
        throw new Error("Socket connection not ready");
      }

      return socket.flow(flowId).structuredQuery(question);
    },
    onError: (err) => {
      console.log("Structured query error:", err);
      const errorMessage =
        err instanceof Error ? err.message : err?.toString() || "Unknown error";
      notify.error(`Structured query failed: ${errorMessage}`);
    },
    onSuccess: (data) => {
      if (data.data) {
        notify.success("Structured query executed successfully");
      } else if (data.errors && data.errors.length > 0) {
        notify.warning("Query executed with errors");
      } else {
        notify.warning("Query processed but returned no data");
      }
    },
  });

  // Show loading indicator for structured query operations
  useActivity(structuredQueryMutation.isPending, "Executing structured query");

  // Return the public API for the hook
  return {
    // Query execution
    executeQuery: structuredQueryMutation.mutate,
    executeQueryAsync: structuredQueryMutation.mutateAsync,
    
    // Query state
    isExecuting: structuredQueryMutation.isPending,
    error: structuredQueryMutation.error,
    data: structuredQueryMutation.data,
    
    // Extracted data for easier access
    queryData: structuredQueryMutation.data?.data,
    queryErrors: structuredQueryMutation.data?.errors,
    hasErrors: structuredQueryMutation.data?.errors && structuredQueryMutation.data.errors.length > 0,
    
    // Reset function to clear previous results
    reset: structuredQueryMutation.reset,
    
    // Socket readiness
    isReady: isSocketReady,
  };
};