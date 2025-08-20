// React Query hooks for data fetching and mutation management
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

// TrustGraph socket connection for API communication
import { useSocket, useConnectionState } from "../api/trustgraph/socket";
// Notification system for user feedback
import { useNotification } from "./notify";
// Activity tracking for loading states
import { useActivity } from "./activity";

/**
 * Custom hook for managing MCP tools (create, read, update, delete operations)
 * Provides CRUD operations for MCP tools stored in the TrustGraph configuration
 */
export const useMcpTools = () => {
  // Socket connection for API calls
  const socket = useSocket();
  const connectionState = useConnectionState();
  // Query client for cache management
  const queryClient = useQueryClient();
  // Notification system for user feedback
  const notify = useNotification();

  // Only enable queries when socket is connected and ready
  const isSocketReady =
    connectionState?.status === "authenticated" ||
    connectionState?.status === "unauthenticated";

  // Query to fetch all MCP tools
  // Uses the list operation to get all MCP tools directly
  const toolsQuery = useQuery({
    queryKey: ["mcp-tools"],
    enabled: isSocketReady,
    queryFn: () => {
      // Get all MCP tools using the getValues operation
      return socket
        .config()
        .getValues("mcp")
        .then((values) => {
          // Parse tool configurations and pair them with their IDs
          // MCP tools have simplified structure: { name: string, url: string }
          return values.map((item) => [item.key, JSON.parse(item.value)]);
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
            type: "mcp",
            key: id,
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
      queryClient.invalidateQueries({ queryKey: ["mcp-tools"] });
      notify.success("Tool updated");
    },
  });

  // Mutation for creating a new tool
  // Creates the tool configuration directly
  const createToolMutation = useMutation({
    mutationFn: ({ id, tool, onSuccess }) => {
      // Create the new tool configuration
      return socket
        .config()
        .putConfig([
          {
            type: "mcp",
            key: id,
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
      // Refresh the tools list after successful creation
      queryClient.invalidateQueries({ queryKey: ["mcp-tools"] });
      notify.success("Tool created");
    },
  });

  // Mutation for deleting a tool
  // Deletes the tool configuration directly
  const deleteToolMutation = useMutation({
    mutationFn: ({ id, onSuccess }) => {
      // Delete the tool configuration
      return socket
        .config()
        .deleteConfig([
          {
            type: "mcp",
            key: id,
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
      // Refresh the tools list after successful deletion
      queryClient.invalidateQueries({ queryKey: ["mcp-tools"] });
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
