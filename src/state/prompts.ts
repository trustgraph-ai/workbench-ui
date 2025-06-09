import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { useSocket } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";

export const usePrompts = () => {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const notify = useNotification();

  const systemPromptQuery = useQuery({
    queryKey: ["system-prompt"],
    queryFn: () => {
      return socket
        .config()
        .getConfig([{ type: "prompt", key: "system" }])
        .then((res) => {
          if (res["error"]) {
            console.log("Error:", res);
            throw res.error.message;
          }
          return JSON.parse(res.values[0].value);
        });
    },
  });

  const promptsQuery = useQuery({
    queryKey: ["prompts"],
    queryFn: () => {
      return socket
        .config()
        .getConfig([{ type: "prompt", key: "template-index" }])
        .then((res) => {
          if (res["error"]) {
            console.log("Error:", res);
            throw res.error.message;
          }
          const promptIds = JSON.parse(res.values[0].value);

          return socket
            .config()
            .getConfig(
              promptIds.map((id) => ({
                type: "prompt",
                key: "template." + id,
              })),
            )
            .then((r) => {
              if (r["error"]) {
                console.log("Error:", r);
                throw r.error.message;
              }
              const config = r.values.map((c) => JSON.parse(c.value));
              return promptIds.map((id, ix) => [id, config[ix]]);
            });
        });
    },
  });

  const updateSystemPromptMutation = useMutation({
    mutationFn: ({ prompt, onSuccess }) => {
      return socket
        .config()
        .putConfig([
          {
            type: "prompt",
            key: "system",
            value: JSON.stringify(prompt),
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
      queryClient.invalidateQueries({ queryKey: ["system-prompt"] });
      notify.success("System prompt updated");
    },
  });

  const updatePromptMutation = useMutation({
    mutationFn: ({ id, prompt, onSuccess }) => {
      return socket
        .config()
        .putConfig([
          {
            type: "prompt",
            key: "template." + id,
            value: JSON.stringify(prompt),
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
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      notify.success("Prompt updated");
    },
  });

  const createPromptMutation = useMutation({
    mutationFn: ({ id, prompt, onSuccess }) => {
      return socket
        .config()
        .getConfig([{ type: "prompt", key: "template-index" }])
        .then((res) => JSON.parse(res.values[0].value))
        .then((existingIds) => {
          const newIds = [...existingIds, id];
          return socket
            .config()
            .putConfig([
              {
                type: "prompt",
                key: "template-index",
                value: JSON.stringify(newIds),
              },
              {
                type: "prompt",
                key: "template." + id,
                value: JSON.stringify(prompt),
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
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      notify.success("Prompt created");
    },
  });

  const deletePromptMutation = useMutation({
    mutationFn: ({ id, onSuccess }) => {
      return socket
        .config()
        .getConfig([{ type: "prompt", key: "template-index" }])
        .then((res) => JSON.parse(res.values[0].value))
        .then((existingIds) => {
          const newIds = existingIds.filter(
            (existingId) => existingId !== id,
          );
          return socket
            .config()
            .putConfig([
              {
                type: "prompt",
                key: "template-index",
                value: JSON.stringify(newIds),
              },
            ])
            .then(() => {
              return socket.config().deleteConfig([
                {
                  type: "prompt",
                  key: "template." + id,
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
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      notify.success("Prompt deleted");
    },
  });

  useActivity(systemPromptQuery.isLoading, "Loading system prompt");
  useActivity(promptsQuery.isLoading, "Loading prompts");
  useActivity(updateSystemPromptMutation.isPending, "Updating system prompt");
  useActivity(updatePromptMutation.isPending, "Updating prompt");
  useActivity(createPromptMutation.isPending, "Creating prompt");
  useActivity(deletePromptMutation.isPending, "Deleting prompt");

  return {
    systemPrompt: systemPromptQuery.data,
    systemPromptLoading: systemPromptQuery.isLoading,
    systemPromptError: systemPromptQuery.error,

    prompts: promptsQuery.data || [],
    promptsLoading: promptsQuery.isLoading,
    promptsError: promptsQuery.error,

    updateSystemPrompt: updateSystemPromptMutation.mutate,
    isUpdatingSystemPrompt: updateSystemPromptMutation.isPending,

    updatePrompt: updatePromptMutation.mutate,
    isUpdatingPrompt: updatePromptMutation.isPending,

    createPrompt: createPromptMutation.mutate,
    isCreatingPrompt: createPromptMutation.isPending,

    deletePrompt: deletePromptMutation.mutate,
    isDeletingPrompt: deletePromptMutation.isPending,

    refetch: () => {
      systemPromptQuery.refetch();
      promptsQuery.refetch();
    },
  };
};
