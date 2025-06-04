
import { useEffect } from "react";

import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { useSocket } from "../api/trustgraph/socket";
import { useActivity } from './activity';

export const useLibrary = () => {
  const socket = useSocket();
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: () => {
      return socket.librarian().getDocuments();
    },
  });

  const documents = documentsQuery.isSuccess ? documentsQuery.data : [];

  const deleteDocumentsMutation = useMutation({
    mutationFn: (ids) => {
      return Promise.all(
        ids.map((id) => socket.librarian().removeDocument(id)),
      );
    },
    onError: (x) => console.log("Error:", x),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
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
