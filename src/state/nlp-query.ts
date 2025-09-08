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
 * Custom hook for managing NLP query operations
 * Provides functionality for converting natural language questions to GraphQL queries
 */
export const useNlpQuery = () => {
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

  // Mutation for converting natural language to GraphQL
  const nlpQueryMutation = useMutation({
    mutationFn: async ({
      question,
      maxResults,
    }: {
      question: string;
      maxResults?: number;
    }) => {
      if (!isSocketReady) {
        throw new Error("Socket connection not ready");
      }

      return socket.flow(flowId).nlpQuery(question, maxResults);
    },
    onError: (err) => {
      console.log("NLP query error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : err?.toString() || "Unknown error";
      notify.error(`NLP query conversion failed: ${errorMessage}`);
    },
    onSuccess: (data) => {
      if (data.graphql_query) {
        notify.success("Natural language converted to GraphQL successfully");
      } else {
        notify.warning("Query processed but no GraphQL generated");
      }
    },
  });

  // Show loading indicator for conversion operations
  useActivity(
    nlpQueryMutation.isPending,
    "Converting natural language to GraphQL",
  );

  // Return the public API for the hook
  return {
    // Query conversion
    convertQuery: nlpQueryMutation.mutate,
    convertQueryAsync: nlpQueryMutation.mutateAsync,

    // Query state
    isConverting: nlpQueryMutation.isPending,
    error: nlpQueryMutation.error,
    data: nlpQueryMutation.data,

    // Extracted data for easier access
    graphqlQuery: nlpQueryMutation.data?.graphql_query,
    variables: nlpQueryMutation.data?.variables,
    detectedSchemas: nlpQueryMutation.data?.detected_schemas,
    confidence: nlpQueryMutation.data?.confidence,

    // Reset function to clear previous results
    reset: nlpQueryMutation.reset,

    // Socket readiness
    isReady: isSocketReady,
  };
};
