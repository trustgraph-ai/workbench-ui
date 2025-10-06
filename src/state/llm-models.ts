import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket, useConnectionState } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";
import { LLMModelParameter, EnumOption } from "../model/llm-models";

export const useLLMModels = () => {
  const socket = useSocket();
  const connectionState = useConnectionState();
  const queryClient = useQueryClient();
  const notify = useNotification();

  const isSocketReady =
    connectionState?.status === "authenticated" ||
    connectionState?.status === "unauthenticated";

  // Fetch the llm-model parameter type
  const paramTypesQuery = useQuery({
    queryKey: ["llm-models"],
    enabled: isSocketReady,
    queryFn: async () => {
      const response = await socket.config().getConfig([
        { type: "parameter-types", key: "llm-model" }
      ]);

      if (!response.values || response.values.length === 0) {
        return [];
      }

      const item = response.values[0];
      const paramDef = JSON.parse(item.value);

      return [{
        name: item.key,
        type: paramDef.type || "string",
        description: paramDef.description || item.key,
        default: paramDef.default || "",
        enum: paramDef.enum || [],
        required: paramDef.required || false,
      }];
    },
  });

  // Update a parameter type's enum and default
  const updateMutation = useMutation({
    mutationFn: async ({
      name,
      enum: enumOptions,
      default: defaultValue,
    }: {
      name: string;
      enum: EnumOption[];
      default: string;
    }) => {
      // Get current parameter type to preserve other fields
      const currentParam = paramTypesQuery.data?.find((pt) => pt.name === name);
      if (!currentParam) {
        throw new Error(`Parameter type ${name} not found`);
      }

      // Update only enum and default, preserve other fields
      const updatedDef = {
        type: currentParam.type,
        description: currentParam.description,
        required: currentParam.required,
        enum: enumOptions,
        default: defaultValue,
      };

      await socket.config().putConfig([
        {
          type: "parameter-types",
          key: name,
          value: JSON.stringify(updatedDef),
        },
      ]);
    },
    onError: (err) => {
      notify.error(err.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-models"] });
      notify.success("Models updated successfully");
    },
  });

  useActivity(paramTypesQuery.isLoading, "Loading LLM models");
  useActivity(updateMutation.isPending, "Updating models");

  return {
    parameterTypes: paramTypesQuery.data || [],
    isLoading: paramTypesQuery.isLoading,
    isError: paramTypesQuery.isError,
    error: paramTypesQuery.error,

    updateParameter: updateMutation.mutate,
    isUpdating: updateMutation.isPending,

    refetch: paramTypesQuery.refetch,
  };
};
