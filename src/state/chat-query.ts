import { useMutation } from "@tanstack/react-query";

import { useSocket } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";
import { useChatStateStore } from "./chat";
import { useWorkbenchStateStore } from "./workbench";
import { useProgressStateStore } from "./progress";
import { useSessionStore } from "./session";
import { RDFS_LABEL } from "../utils/knowledge-graph";
import { Entity } from "./entity";
import { Triple, Value } from "./triples";

/**
 * Custom hook for managing chat operations using React Query
 * Provides functionality for sending chat messages and handling responses
 * @returns {Object} Chat operations and state
 */
export const useChat = () => {
  // WebSocket connection for communicating with the chat service
  const socket = useSocket();

  // Hook for displaying user notifications
  const notify = useNotification();

  // Chat state management
  const addMessage = useChatStateStore((state) => state.addMessage);
  const setInput = useChatStateStore((state) => state.setInput);

  // Progress and activity management
  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  // Session and workbench state
  const flowId = useSessionStore((state) => state.flowId);
  const setEntities = useWorkbenchStateStore((state) => state.setEntities);

  /**
   * Mutation for sending chat messages and handling Graph RAG responses
   */
  const chatMutation = useMutation({
    mutationFn: async ({ input }: { input: string }) => {
      // Add user message immediately
      addMessage("human", input);

      const ragActivity = "Graph RAG: " + input;
      const embActivity = "Find entities: " + input;

      // Start Graph RAG activity
      addActivity(ragActivity);

      try {
        // Execute Graph RAG request
        const ragResponse = await socket.flow(flowId).graphRag(input);
        addMessage("ai", ragResponse);
        removeActivity(ragActivity);

        // Start embeddings activity
        addActivity(embActivity);

        // Get embeddings for the input
        const embeddings = await socket.flow(flowId).embeddings(input);

        // Query graph embeddings to find entities
        const entities = await socket
          .flow(flowId)
          .graphEmbeddingsQuery(embeddings, 15);

        // Get labels for each entity
        const labelPromises = entities.map(async (entity: Value) => {
          const labelActivity = "Label " + entity.v;
          addActivity(labelActivity);

          try {
            const triples = await socket
              .flow(flowId)
              .triplesQuery(entity, { v: RDFS_LABEL, e: true }, undefined, 1);
            removeActivity(labelActivity);
            return triples;
          } catch (err) {
            removeActivity(labelActivity);
            throw err;
          }
        });

        const labelResponses = await Promise.all(labelPromises);

        // Convert graph labels to entity list
        const entityList: Entity[] = labelResponses
          .filter((resp) => resp && resp.length > 0)
          .map((resp: Triple[]) => ({
            label: resp[0].o.v,
            uri: resp[0].s.v,
          }));

        setEntities(entityList);
        removeActivity(embActivity);

        // Clear input after successful submission
        setInput("");

        return ragResponse;
      } catch (error) {
        // Clean up activities on error
        removeActivity(ragActivity);
        removeActivity(embActivity);

        // Add error message to chat
        const errorMessage =
          error instanceof Error
            ? error.message
            : error?.toString() || "Unknown error";
        addMessage("ai", errorMessage);

        // Clear input even on error
        setInput("");

        throw error;
      }
    },
    onError: (err) => {
      console.log("Chat error:", err);
      notify.error(err.toString());
    },
  });

  // Show loading indicator for chat operations
  useActivity(chatMutation.isPending, "Processing chat message");

  // Return chat operations for use in components
  return {
    // Chat submission
    submitMessage: chatMutation.mutate,
    isSubmitting: chatMutation.isPending,
    submitError: chatMutation.error,
  };
};
