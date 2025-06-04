import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { useSocket } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";
import { v4 as uuidv4 } from "uuid";

export const useLibrary = (notifyDeletion?) => {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const notify = useNotification();

  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: () => {
      return socket.librarian().getDocuments();
    },
  });

  const deleteDocumentsMutation = useMutation({
    mutationFn: ({ ids, onSuccess }) => {
      return Promise.all(
        ids.map((id) => socket.librarian().removeDocument(id)),
      ).then(() => {
        if (onSuccess) onSuccess();
      });
    },
    onError: (err) => {
      console.log("Error:", err);
      notify.error(err.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      notify.success("Successful deletion");
      if (notifyDeletion) notifyDeletion();
    },
  });

  const submitDocumentsMutation = useMutation({
    mutationFn: ({ ids, flow, tags, onSuccess }) => {
      // FIXME: Needs to be properly implemented.
      const user = "trustgraph";
      const collection = "default";

      return Promise.all(
        ids.map((id) => {
          const proc_id = uuidv4();
          return socket
            .librarian()
            .addProcessing(proc_id, id, flow, user, collection, tags);
        }),
      ).then(() => {
        if (onSuccess) onSuccess();
      });
    },
    onError: (err) => {
      console.log("Error:", err);
      notify.error(err.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      notify.success("Successful deletion");
      if (notifyDeletion) notifyDeletion();
    },
  });

  useActivity(documentsQuery.isLoading, "Loading documents");
  useActivity(deleteDocumentsMutation.isPending, "Deleting documents");

  return {
    documents: documentsQuery.data,
    isLoading: documentsQuery.isLoading,
    isError: documentsQuery.isError,
    error: documentsQuery.error,

    deleteDocuments: deleteDocumentsMutation.mutate,
    isDeleting: deleteDocumentsMutation.isPending,
    deleteError: deleteDocumentsMutation.error,

    submitDocuments: submitDocumentsMutation.mutate,
    isSubmitting: submitDocumentsMutation.isPending,
    submitError: submitDocumentsMutation.error,

    refetch: documentsQuery.refetch,
  };
};
