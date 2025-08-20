import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { v4 as uuidv4 } from "uuid";

import { useSocket, useConnectionState } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";
import { fileToBase64, textToBase64 } from "../utils/document-encoding";
import { prepareMetadata, createDocId } from "../model/document-metadata";

/**
 * Custom hook for managing document library operations
 * Provides functionality for fetching, deleting, and submitting documents
 * @returns {Object} Library state and operations
 */
export const useLibrary = () => {
  // WebSocket connection for communicating with the librarian service
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
   * Query for fetching all documents from the library
   * Uses React Query for caching and background refetching
   */
  const documentsQuery = useQuery({
    queryKey: ["documents"],
    enabled: isSocketReady,
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
      notify.success("Successful submission");
    },
  });

  /**
   * Uploading documents into the library.  Puts the documents in the
   * library, but does not initiate processing.
   */
  const uploadFilesMutation = useMutation({
    mutationFn: ({ files, params, mimeType, user, onSuccess }) => {
      // Create processing entries for each document
      return Promise.all(
        files.map((file) => {
          // Generate unique doc ID for each document
          const doc_id = createDocId();

          const meta = prepareMetadata(doc_id, params);

          return fileToBase64(file)
            .then((enc) => {
              return socket
                .librarian()
                .loadDocument(
                  enc,
                  doc_id,
                  meta,
                  mimeType,
                  params.title,
                  params.comments,
                  params.keywords,
                  user,
                );
            })
            .then(() => {
              // Execute success callback if provided
              if (onSuccess) onSuccess();
            });
        }),
      );
    },
    onError: (err) => {
      console.log("Error:", err);
      // Show error notification to user
      notify.error(err.toString());
    },
    onSuccess: () => {
      // Invalidate documents cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      notify.success("Successful upload");
    },
  });

  /**
   * Uploading text into the library.  Puts the text in the
   * library, but does not initiate processing.
   */
  const uploadTextsMutation = useMutation({
    mutationFn: ({ texts, params, mimeType, user, onSuccess }) => {
      // Create processing entries for each document
      return Promise.all(
        texts.map((text) => {
          // Generate unique doc ID for each document
          const doc_id = createDocId();

          const enc = textToBase64(text);

          const meta = prepareMetadata(doc_id, params);

          return socket
            .librarian()
            .loadDocument(
              enc,
              doc_id,
              meta,
              mimeType,
              params.title,
              params.comments,
              params.keywords,
              user,
            );
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
      // Notify
      notify.success("Successful upload");
    },
  });

  // Show loading indicators for long-running operations
  useActivity(documentsQuery.isLoading, "Loading documents");
  useActivity(deleteDocumentsMutation.isPending, "Deleting documents");
  useActivity(submitDocumentsMutation.isPending, "Submitting documents");
  useActivity(uploadFilesMutation.isPending, "Uploading files");
  useActivity(uploadTextsMutation.isPending, "Uploading text");

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

    // Document upload operations
    uploadFiles: uploadFilesMutation.mutate,
    isUploadingFiles: uploadFilesMutation.isPending,
    filesUploadError: uploadFilesMutation.error,

    // Document upload operations
    uploadTexts: uploadTextsMutation.mutate,
    isUploadingTexts: uploadTextsMutation.isPending,
    textsUploadError: uploadTextsMutation.error,

    // Manual refetch function
    refetch: documentsQuery.refetch,
  };
};
