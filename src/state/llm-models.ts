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

  // Fetch all parameter types that have enum arrays (LLM model types)
  const paramTypesQuery = useQuery({
    queryKey: ["llm-models"],
    enabled: isSocketReady,
    queryFn: async () => {
      const response = await socket.config().getValues("parameter-types");

      // Filter to only parameter types with enum arrays
      const llmParams: LLMModelParameter[] = [];

      response.values?.forEach((item) => {
        try {
          const paramDef = JSON.parse(item.value);

          // Only include if it has an enum array
          if (paramDef.enum && Array.isArray(paramDef.enum)) {
            llmParams.push({
              name: item.key,
              type: paramDef.type || "string",
              description: paramDef.description || item.key,
              default: paramDef.default || "",
              enum: paramDef.enum,
              required: paramDef.required || false,
            });
          }
        } catch (error) {
          console.error(`Failed to parse parameter type ${item.key}:`, error);
        }
      });

      return llmParams;
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
