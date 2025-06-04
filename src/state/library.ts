import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { useSocket } from "../api/trustgraph/socket";
import { useNotification } from './notify';
import { useActivity } from "./activity";

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
      mutationFn: ({ids, onSuccess}) => {
      return Promise.all(
        ids.map((id) => socket.librarian().removeDocument(id)),
      ).then(
          () => {
              if (onSuccess) onSuccess();
          }
      )
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
    refetch: documentsQuery.refetch,
  };
};
