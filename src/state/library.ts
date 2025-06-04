import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useSocket } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";
import { v4 as uuidv4 } from "uuid";

/**
 * Custom hook for managing document library operations
 * Provides functionality for fetching, deleting, and submitting documents
 * @param {Function} notifyDeletion - Optional callback function to execute
 * after successful deletion
 * @returns {Object} Library state and operations
 */
export const useLibrary = (notifyDeletion?) => {
  // WebSocket connection for communicating with the librarian service
  const socket = useSocket();

  // React Query client for cache management and invalidation
  const queryClient = useQueryClient();

  // Hook for displaying user notifications
  const notify = useNotification();

  /**
   * Query for fetching all documents from the library
   * Uses React Query for caching and background refetching
   */
  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: () => {
      return socket.librarian().getDocuments();
    },
  });

  /**
   * Mutation for deleting multiple documents
   * Executes parallel deletion requests and handles success/error states
   */
  const deleteDocumentsMutation = useMutation({
    mutationFn: ({ ids, onSuccess }) => {
      // Execute deletion requests in parallel for all document IDs
      return Promise.all(
        ids.map((id) => socket.librarian().removeDocument(id)),
      ).then(() => {
        // Execute success callback if provided
        if (onSuccess) onSuccess();
      });
    },
    onError: (err) => {
      console.log("Error:", err);
      // Show error notification to user
      notify.error(err.toString());
    },
    onSuccess: () => {
      // Invalidate documents cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      // Show success notification
      notify.success("Successful deletion");
      // Execute optional deletion notification callback
      if (notifyDeletion) notifyDeletion();
    },
  });

  /**
   * Mutation for submitting documents to processing workflows
   * Creates processing entries for each document with specified flow and tags
   */
  const submitDocumentsMutation = useMutation({
    mutationFn: ({ ids, flow, tags, onSuccess }) => {
      // FIXME: Needs to be properly implemented.
      // Hardcoded values that should be configurable
      const user = "trustgraph";
      const collection = "default";

      // Create processing entries for each document
      return Promise.all(
        ids.map((id) => {
          // Generate unique processing ID for each document
          const proc_id = uuidv4();
          return socket
            .librarian()
            .addProcessing(proc_id, id, flow, user, collection, tags);
        }),
      ).then(() => {
        // Execute success callback if provided
        if (onSuccess) onSuccess();
      });
    },
    onError: (err) => {
      console.log("Error:", err);
      // Show error notification to user
      notify.error(err.toString());
    },
    onSuccess: () => {
      // Invalidate documents cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      // TODO: Fix this notification - should say "Successful submission"
      notify.success("Successful deletion");
      // Execute optional deletion notification callback
      if (notifyDeletion) notifyDeletion();
    },
  });

  // Show loading indicators for long-running operations
  useActivity(documentsQuery.isLoading, "Loading documents");
  useActivity(deleteDocumentsMutation.isPending, "Deleting documents");

  // Return library state and operations for use in components
  return {
    // Document data and query state
    documents: documentsQuery.data,
    isLoading: documentsQuery.isLoading,
    isError: documentsQuery.isError,
    error: documentsQuery.error,

    // Document deletion operations
    deleteDocuments: deleteDocumentsMutation.mutate,
    isDeleting: deleteDocumentsMutation.isPending,
    deleteError: deleteDocumentsMutation.error,

    // Document submission operations
    submitDocuments: submitDocumentsMutation.mutate,
    isSubmitting: submitDocumentsMutation.isPending,
    submitError: submitDocumentsMutation.error,

    // Manual refetch function
    refetch: documentsQuery.refetch,
  };
};
