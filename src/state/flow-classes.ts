import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket, useConnectionState } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";

/**
 * Flow class definition interface
 */
export interface FlowClassDefinition {
  id?: string;
  class: {
    [key: string]: {
      [queueName: string]: string;
    };
  };
  flow: {
    [key: string]: {
      [queueName: string]: string;
    };
  };
  interfaces: {
    [key: string]: string | {
      request: string;
      response: string;
    };
  };
  description?: string;
  tags?: string[];
}

/**
 * Custom hook for managing flow class operations
 * Provides functionality for fetching, creating, updating, and deleting flow classes
 * @returns {Object} Flow class state and operations
 */
export const useFlowClasses = () => {
  // WebSocket connection for communicating with the config service
  const socket = useSocket();
  const connectionState = useConnectionState();
  
  // React Query client for cache management and invalidation
  const queryClient = useQueryClient();
  
  // Hook for displaying user notifications
  const notify = useNotification();

  // Only enable queries when socket is connected and ready
  const isSocketReady =
    connectionState?.status === "authenticated" ||
    connectionState?.status === "unauthenticated";

  /**
   * Query for fetching all flow classes
   * Uses React Query for caching and background refetching
   */
  const query = useQuery({
    queryKey: ["flow-classes"],
    enabled: isSocketReady,
    staleTime: 0, // Force fresh data
    gcTime: 0, // Don't cache (React Query v5 uses gcTime instead of cacheTime)
    refetchOnMount: 'always',
    queryFn: async (): Promise<FlowClassDefinition[]> => {
      console.log('useFlowClasses queryFn called');
      try {
        const response = await socket.config().getConfigAll();
        
        console.log('Flow Classes API Response:', response);
        console.log('Flow Classes Config:', response.config["flow-classes"]);
        
        // Handle both array and object responses
        const config = response.config["flow-classes"];
        
        if (Array.isArray(config)) {
          // If it's already an array, check if it's an array of [key, value] pairs
          if (config.length > 0 && Array.isArray(config[0]) && config[0].length === 2) {
            // It's an array of [id, flowClass] pairs - convert to objects
            console.log('useFlowClasses: Converting array of [id, flowClass] pairs');
            console.log('useFlowClasses: Raw config:', config);
            const converted = config.map(([id, flowClassData]) => {
              let flowClass = flowClassData;
              // If the flowClass is a JSON string, parse it
              if (typeof flowClassData === 'string') {
                try {
                  flowClass = JSON.parse(flowClassData);
                } catch (error) {
                  console.error(`Failed to parse flow class JSON for ${id}:`, error);
                  flowClass = flowClassData;
                }
              }
              return {
                id,
                ...(flowClass as Omit<FlowClassDefinition, 'id'>)
              };
            });
            console.log('useFlowClasses: Converted flow classes:', converted);
            return converted;
          } else {
            // It's already an array of flow class objects
            console.log('useFlowClasses: Using existing array of flow class objects');
            return config;
          }
        } else if (config && typeof config === 'object') {
          // Convert object to array of flow classes
          console.log('useFlowClasses: Converting object to array of flow classes');
          const converted = Object.entries(config).map(([id, flowClassData]) => {
            let flowClass = flowClassData;
            // If the flowClass is a JSON string, parse it
            if (typeof flowClassData === 'string') {
              try {
                flowClass = JSON.parse(flowClassData);
              } catch (error) {
                console.error(`Failed to parse flow class JSON for ${id}:`, error);
                flowClass = flowClassData;
              }
            }
            return {
              id,
              ...(flowClass as Omit<FlowClassDefinition, 'id'>)
            };
          });
          console.log('useFlowClasses: Converted flow classes:', converted);
          return converted;
        }
        
        console.log('No flow classes config found, returning empty array');
        return [];
      } catch (error) {
        console.error('Failed to fetch flow classes:', error);
        throw new Error('Failed to fetch flow classes');
      }
    },
  });

  // Track loading state
  useActivity(query.isLoading, "Loading flow classes");

  /**
   * Mutation for creating a new flow class
   */
  const createMutation = useMutation({
    mutationFn: async ({ id, flowClass }: { 
      id: string; 
      flowClass: Omit<FlowClassDefinition, 'id'> 
    }): Promise<FlowClassDefinition> => {
      try {
        await socket.config().putConfig([{
          type: "flow-classes",
          key: id,
          value: JSON.stringify(flowClass)
        }]);
        
        return {
          id,
          ...flowClass
        };
      } catch (error) {
        console.error(`Failed to create flow class ${id}:`, error);
        throw new Error(`Failed to create flow class: ${id}`);
      }
    },
    onSuccess: (flowClass) => {
      // Invalidate and refetch flow classes
      queryClient.invalidateQueries({ queryKey: ["flow-classes"] });
      
      notify.success(`Flow class "${flowClass.id}" created successfully`);
    },
    onError: (error: Error) => {
      notify.error(`Failed to create flow class: ${error.message}`);
    },
  });

  /**
   * Mutation for updating an existing flow class
   */
  const updateMutation = useMutation({
    mutationFn: async ({ id, flowClass }: { 
      id: string; 
      flowClass: Partial<Omit<FlowClassDefinition, 'id'>>
    }): Promise<FlowClassDefinition> => {
      try {
        // Get current flow class to merge changes
        const currentResponse = await socket.config().getConfig([{
          type: "flow-classes",
          key: id
        }]);
        
        const updatedFlowClass = {
          ...currentResponse.config["flow-classes"][id],
          ...flowClass
        };

        await socket.config().putConfig([{
          type: "flow-classes",
          key: id,
          value: JSON.stringify(updatedFlowClass)
        }]);
        
        return {
          id,
          ...updatedFlowClass
        };
      } catch (error) {
        console.error(`Failed to update flow class ${id}:`, error);
        throw new Error(`Failed to update flow class: ${id}`);
      }
    },
    onSuccess: (flowClass) => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: ["flow-classes"] });
      
      notify.success(`Flow class "${flowClass.id}" updated successfully`);
    },
    onError: (error: Error) => {
      notify.error(`Failed to update flow class: ${error.message}`);
    },
  });

  /**
   * Mutation for deleting a flow class
   */
  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      try {
        await socket.config().deleteConfig({
          type: "flow-classes",
          key: id
        });
      } catch (error) {
        console.error(`Failed to delete flow class ${id}:`, error);
        throw new Error(`Failed to delete flow class: ${id}`);
      }
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.invalidateQueries({ queryKey: ["flow-classes"] });
      
      notify.success(`Flow class "${id}" deleted successfully`);
    },
    onError: (error: Error) => {
      notify.error(`Failed to delete flow class: ${error.message}`);
    },
  });

  /**
   * Mutation for duplicating a flow class
   */
  const duplicateMutation = useMutation({
    mutationFn: async ({ sourceId, targetId }: { 
      sourceId: string; 
      targetId: string;
    }): Promise<FlowClassDefinition> => {
      try {
        // Get source flow class
        const sourceResponse = await socket.config().getConfig([{
          type: "flow-classes",
          key: sourceId
        }]);
        
        const sourceFlowClass = sourceResponse.config["flow-classes"][sourceId] as Omit<FlowClassDefinition, 'id'>;
        
        // Create duplicate with updated description
        const duplicatedFlowClass = {
          ...sourceFlowClass,
          description: `${sourceFlowClass.description || sourceId} (Copy)`,
          tags: [...(sourceFlowClass.tags || []), 'copy']
        };

        // Save as new flow class
        await socket.config().putConfig([{
          type: "flow-classes",
          key: targetId,
          value: JSON.stringify(duplicatedFlowClass)
        }]);
        
        return {
          id: targetId,
          ...duplicatedFlowClass
        };
      } catch (error) {
        console.error(`Failed to duplicate flow class ${sourceId}:`, error);
        throw new Error(`Failed to duplicate flow class: ${sourceId}`);
      }
    },
    onSuccess: (flowClass) => {
      queryClient.invalidateQueries({ queryKey: ["flow-classes"] });
      
      notify.success(`Flow class duplicated as "${flowClass.id}"`);
    },
    onError: (error: Error) => {
      notify.error(`Failed to duplicate flow class: ${error.message}`);
    },
  });

  // Track mutation loading states
  useActivity(createMutation.isPending, "Creating flow class");
  useActivity(updateMutation.isPending, "Updating flow class");
  useActivity(deleteMutation.isPending, "Deleting flow class");
  useActivity(duplicateMutation.isPending, "Duplicating flow class");

  return {
    // Query state
    flowClasses: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,

    // Utilities
    getFlowClass: (id: string): FlowClassDefinition | undefined => {
      console.log('getFlowClass - Looking for ID:', id);
      console.log('getFlowClass - Available data:', query.data);
      const found = query.data?.find(fc => {
        console.log('getFlowClass - Comparing with fc.id:', fc.id);
        return fc.id === id;
      });
      console.log('getFlowClass - Found:', found);
      return found;
    },
    exists: (id: string): boolean => {
      return query.data?.some(fc => fc.id === id) ?? false;
    },

    // Mutations
    createFlowClass: createMutation.mutateAsync,
    updateFlowClass: updateMutation.mutateAsync,
    deleteFlowClass: deleteMutation.mutateAsync,
    duplicateFlowClass: duplicateMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
  };
};

/**
 * Generate a unique flow class ID
 */
export const generateFlowClassId = (baseName = 'flow-class'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${baseName}-${timestamp}-${random}`;
};

/**
 * Validate flow class ID format
 */
export const isValidFlowClassId = (id: string): boolean => {
  // Flow class IDs should be kebab-case, alphanumeric with hyphens
  return /^[a-z0-9-]+$/.test(id) && id.length >= 3 && id.length <= 50;
};