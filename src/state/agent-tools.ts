// React Query hooks for data fetching and mutation management
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

// TrustGraph socket connection for API communication
import { useSocket } from "../api/trustgraph/socket";
// Notification system for user feedback
import { useNotification } from "./notify";
// Activity tracking for loading states
import { useActivity } from "./activity";

/**
 * Custom hook for managing agent tools (create, read, update, delete operations)
 * Provides CRUD operations for agent tools stored in the TrustGraph configuration
 */
export const useAgentTools = () => {
  // Socket connection for API calls
  const socket = useSocket();
  // Query client for cache management
  const queryClient = useQueryClient();
  // Notification system for user feedback
  const notify = useNotification();

  // Query to fetch all agent tools
  // First gets the tool index (list of tool IDs), then fetches each tool's configuration
  const toolsQuery = useQuery({
    queryKey: ["agent-tools"],
    queryFn: () => {
      // Step 1: Get the tool index (array of tool IDs)
      return socket
        .config()
        .getConfig([{ type: "agent", key: "tool-index" }])
        .then((res) => {
          if (res["error"]) {
            console.log("Error:", res);
            throw res.error.message;
          }
          const toolIds = JSON.parse(res.values[0].value);

          // Step 2: Fetch configuration for each tool using their IDs
          return socket
            .config()
            .getConfig(
              toolIds.map((id) => ({
                type: "agent",
                key: "tool." + id,
              })),
            )
            .then((r) => {
              if (r["error"]) {
                console.log("Error:", r);
                throw r.error.message;
              }
              // Parse tool configurations and pair them with their IDs
              const config = r.values.map((c) => JSON.parse(c.value));
              return toolIds.map((id, ix) => [id, config[ix]]);
            });
        });
    },
  });

  // Mutation for updating an existing tool's configuration
  const updateToolMutation = useMutation({
    mutationFn: ({ id, tool, onSuccess }) => {
      // Update the tool configuration in the backend
      return socket
        .config()
        .putConfig([
          {
            type: "agent",
            key: "tool." + id,
            value: JSON.stringify(tool),
          },
        ])
        .then((x) => {
          if (x["error"]) {
            console.log("Error:", x);
            throw x.error.message;
          }
          // Execute callback if provided
          if (onSuccess) onSuccess();
        });
    },
    onError: (err) => {
      console.log("Error:", err);
      notify.error(err.toString());
    },
    onSuccess: () => {
      // Refresh the tools list after successful update
      queryClient.invalidateQueries({ queryKey: ["agent-tools"] });
      notify.success("Tool updated");
    },
  });

  // Mutation for creating a new tool
  // Updates both the tool index and creates the tool configuration
  const createToolMutation = useMutation({
    mutationFn: ({ id, tool, onSuccess }) => {
      // Step 1: Get current tool index
      return socket
        .config()
        .getConfig([{ type: "agent", key: "tool-index" }])
        .then((res) => JSON.parse(res.values[0].value))
        .then((existingIds) => {
          // Step 2: Add new tool ID to the index
          const newIds = [...existingIds, id];
          // Step 3: Update both the tool index and create the new tool configuration
          return socket
            .config()
            .putConfig([
              {
                type: "agent",
                key: "tool-index",
                value: JSON.stringify(newIds),
              },
              {
                type: "agent",
                key: "tool." + id,
                value: JSON.stringify(tool),
              },
            ])
            .then((x) => {
              if (x["error"]) {
                console.log("Error:", x);
                throw x.error.message;
              }
              // Execute callback if provided
              if (onSuccess) onSuccess();
            });
        });
    },
    onError: (err) => {
      console.log("Error:", err);
      notify.error(err.toString());
    },
    onSuccess: () => {
      // Refresh the tools list after successful creation
      queryClient.invalidateQueries({ queryKey: ["agent-tools"] });
      notify.success("Tool created");
    },
  });

  // Mutation for deleting a tool
  // Removes the tool from both the index and deletes its configuration
  const deleteToolMutation = useMutation({
    mutationFn: ({ id, onSuccess }) => {
      // Step 1: Get current tool index
      return socket
        .config()
        .getConfig([{ type: "agent", key: "tool-index" }])
        .then((res) => JSON.parse(res.values[0].value))
        .then((existingIds) => {
          // Step 2: Remove the tool ID from the index
          const newIds = existingIds.filter(
            (existingId) => existingId !== id,
          );
          // Step 3: Update the tool index
          return socket
            .config()
            .putConfig([
              {
                type: "agent",
                key: "tool-index",
                value: JSON.stringify(newIds),
              },
            ])
            .then(() => {
              // Step 4: Delete the tool configuration
              return socket.config().deleteConfig([
                {
                  type: "agent",
                  key: "tool." + id,
                },
              ]);
            })
            .then((x) => {
              if (x["error"]) {
                console.log("Error:", x);
                throw x.error.message;
              }
              // Execute callback if provided
              if (onSuccess) onSuccess();
            });
        });
    },
    onError: (err) => {
      console.log("Error:", err);
      notify.error(err.toString());
    },
    onSuccess: () => {
      // Refresh the tools list after successful deletion
      queryClient.invalidateQueries({ queryKey: ["agent-tools"] });
      notify.success("Tool deleted");
    },
  });

  // Track loading states for UI feedback
  useActivity(toolsQuery.isLoading, "Loading tools");
  useActivity(updateToolMutation.isPending, "Updating tool");
  useActivity(createToolMutation.isPending, "Creating tool");
  useActivity(deleteToolMutation.isPending, "Deleting tool");

  // Return the public API for the hook
  return {
    // Tools data and query state
    tools: toolsQuery.data || [], // Array of [id, toolConfig] pairs
    isLoading: toolsQuery.isLoading,
    isError: toolsQuery.isError,
    error: toolsQuery.error,

    // Update tool operations
    updateTool: updateToolMutation.mutate,
    isUpdatingTool: updateToolMutation.isPending,

    // Create tool operations
    createTool: createToolMutation.mutate,
    isCreatingTool: createToolMutation.isPending,

    // Delete tool operations
    deleteTool: deleteToolMutation.mutate,
    isDeletingTool: deleteToolMutation.isPending,

    // Manual refetch function
    refetch: toolsQuery.refetch,
  };
};
