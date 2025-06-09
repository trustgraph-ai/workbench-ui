import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { useSocket } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";

export const useAgentTools = () => {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const notify = useNotification();

  const toolsQuery = useQuery({
    queryKey: ["agent-tools"],
    queryFn: () => {
      return socket
        .config()
        .getConfig([{ type: "agent", key: "tool-index" }])
        .then((res) => {
          if (res["error"]) {
            console.log("Error:", res);
            throw res.error.message;
          }
          const toolIds = JSON.parse(res.values[0].value);

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
              const config = r.values.map((c) => JSON.parse(c.value));
              return toolIds.map((id, ix) => [id, config[ix]]);
            });
        });
    },
  });

  const updateToolMutation = useMutation({
    mutationFn: ({ id, tool, onSuccess }) => {
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
          if (onSuccess) onSuccess();
        });
    },
    onError: (err) => {
      console.log("Error:", err);
      notify.error(err.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-tools"] });
      notify.success("Tool updated");
    },
  });

  const createToolMutation = useMutation({
    mutationFn: ({ id, tool, onSuccess }) => {
      return toolsQuery.data
        ? Promise.resolve(toolsQuery.data.map(([existingId]) => existingId))
        : socket
            .config()
            .getConfig([{ type: "agent", key: "tool-index" }])
            .then((res) => JSON.parse(res.values[0].value))
        .then((existingIds) => {
          const newIds = [...existingIds, id];
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
              if (onSuccess) onSuccess();
            });
        });
    },
    onError: (err) => {
      console.log("Error:", err);
      notify.error(err.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-tools"] });
      notify.success("Tool created");
    },
  });

  const deleteToolMutation = useMutation({
    mutationFn: ({ id, onSuccess }) => {
      return toolsQuery.data
        ? Promise.resolve(toolsQuery.data.map(([existingId]) => existingId))
        : socket
            .config()
            .getConfig([{ type: "agent", key: "tool-index" }])
            .then((res) => JSON.parse(res.values[0].value))
        .then((existingIds) => {
          const newIds = existingIds.filter((existingId) => existingId !== id);
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
              if (onSuccess) onSuccess();
            });
        });
    },
    onError: (err) => {
      console.log("Error:", err);
      notify.error(err.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-tools"] });
      notify.success("Tool deleted");
    },
  });

  useActivity(toolsQuery.isLoading, "Loading tools");
  useActivity(updateToolMutation.isPending, "Updating tool");
  useActivity(createToolMutation.isPending, "Creating tool");
  useActivity(deleteToolMutation.isPending, "Deleting tool");

  return {
    tools: toolsQuery.data || [],
    isLoading: toolsQuery.isLoading,
    isError: toolsQuery.isError,
    error: toolsQuery.error,

    updateTool: updateToolMutation.mutate,
    isUpdatingTool: updateToolMutation.isPending,

    createTool: createToolMutation.mutate,
    isCreatingTool: createToolMutation.isPending,

    deleteTool: deleteToolMutation.mutate,
    isDeletingTool: deleteToolMutation.isPending,

    refetch: toolsQuery.refetch,
  };
};