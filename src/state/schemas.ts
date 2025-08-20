import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { useSocket, useConnectionState } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";

export const useSchemas = () => {
  const socket = useSocket();
  const connectionState = useConnectionState();
  const queryClient = useQueryClient();
  const notify = useNotification();

  // Only enable queries when socket is connected and ready
  const isSocketReady =
    connectionState?.status === "authenticated" ||
    connectionState?.status === "unauthenticated";

  const schemasQuery = useQuery({
    queryKey: ["schemas"],
    enabled: isSocketReady,
    queryFn: () => {
      return socket
        .config()
        .getValues("schema")
        .then((values) => {
          return values.map((item) => [item.key, JSON.parse(item.value)]);
        })
        .catch((err) => {
          console.log("Error:", err);
          throw err;
        });
    },
  });

  const updateSchemaMutation = useMutation({
    mutationFn: ({ id, schema, onSuccess }) => {
      return socket
        .config()
        .putConfig([
          {
            type: "schema",
            key: id,
            value: JSON.stringify(schema),
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
      queryClient.invalidateQueries({ queryKey: ["schemas"] });
      notify.success("Schema updated");
    },
  });

  const createSchemaMutation = useMutation({
    mutationFn: ({ id, schema, onSuccess }) => {
      return socket
        .config()
        .putConfig([
          {
            type: "schema",
            key: id,
            value: JSON.stringify(schema),
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
      queryClient.invalidateQueries({ queryKey: ["schemas"] });
      notify.success("Schema created");
    },
  });

  const deleteSchemaMutation = useMutation({
    mutationFn: ({ id, onSuccess }) => {
      return socket
        .config()
        .deleteConfig([
          {
            type: "schema",
            key: id,
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
      queryClient.invalidateQueries({ queryKey: ["schemas"] });
      notify.success("Schema deleted");
    },
  });

  useActivity(schemasQuery.isLoading, "Loading schemas");
  useActivity(updateSchemaMutation.isPending, "Updating schema");
  useActivity(createSchemaMutation.isPending, "Creating schema");
  useActivity(deleteSchemaMutation.isPending, "Deleting schema");

  return {
    schemas: schemasQuery.data || [],
    schemasLoading: schemasQuery.isLoading,
    schemasError: schemasQuery.error,

    updateSchema: updateSchemaMutation.mutate,
    isUpdatingSchema: updateSchemaMutation.isPending,

    createSchema: createSchemaMutation.mutate,
    isCreatingSchema: createSchemaMutation.isPending,

    deleteSchema: deleteSchemaMutation.mutate,
    isDeletingSchema: deleteSchemaMutation.isPending,

    refetch: () => {
      schemasQuery.refetch();
    },
  };
};
