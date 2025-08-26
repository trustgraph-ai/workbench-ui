import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { useSocket, useConnectionState } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";

export interface OntologyMetadata {
  name: string;
  description: string;
  version: string;
  created: string;
  modified: string;
  creator: string;
  namespace: string;
}

export interface OntologyConcept {
  id: string;
  prefLabel: string;
  altLabel?: string[];
  definition?: string;
  scopeNote?: string;
  example?: string[];
  notation?: string;
  broader?: string | null;
  narrower?: string[];
  related?: string[];
  topConcept?: boolean;
}

export interface OntologyScheme {
  uri: string;
  prefLabel: string;
  hasTopConcept: string[];
}

export interface Ontology {
  metadata: OntologyMetadata;
  concepts: Record<string, OntologyConcept>;
  scheme: OntologyScheme;
}

export const useOntologies = () => {
  const socket = useSocket();
  const connectionState = useConnectionState();
  const queryClient = useQueryClient();
  const notify = useNotification();

  // Only enable queries when socket is connected and ready
  const isSocketReady =
    connectionState?.status === "authenticated" ||
    connectionState?.status === "unauthenticated";

  const ontologiesQuery = useQuery({
    queryKey: ["ontologies"],
    enabled: isSocketReady,
    queryFn: () => {
      return socket
        .config()
        .getValues("ontology")
        .then((values) => {
          return values.map((item) => [item.key, JSON.parse(item.value)]);
        })
        .catch((err) => {
          console.log("Error:", err);
          throw err;
        });
    },
  });

  const updateOntologyMutation = useMutation({
    mutationFn: ({
      id,
      ontology,
      onSuccess,
    }: {
      id: string;
      ontology: Ontology;
      onSuccess?: () => void;
    }) => {
      return socket
        .config()
        .putConfig([
          {
            type: "ontology",
            key: id,
            value: JSON.stringify(ontology),
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
      queryClient.invalidateQueries({ queryKey: ["ontologies"] });
      notify.success("Ontology updated");
    },
  });

  const createOntologyMutation = useMutation({
    mutationFn: ({
      id,
      ontology,
      onSuccess,
    }: {
      id: string;
      ontology: Ontology;
      onSuccess?: () => void;
    }) => {
      return socket
        .config()
        .putConfig([
          {
            type: "ontology",
            key: id,
            value: JSON.stringify(ontology),
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
      queryClient.invalidateQueries({ queryKey: ["ontologies"] });
      notify.success("Ontology created");
    },
  });

  const deleteOntologyMutation = useMutation({
    mutationFn: ({
      id,
      onSuccess,
    }: {
      id: string;
      onSuccess?: () => void;
    }) => {
      return socket
        .config()
        .deleteConfig([
          {
            type: "ontology",
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
      queryClient.invalidateQueries({ queryKey: ["ontologies"] });
      notify.success("Ontology deleted");
    },
  });

  useActivity(ontologiesQuery.isLoading, "Loading ontologies");
  useActivity(updateOntologyMutation.isPending, "Updating ontology");
  useActivity(createOntologyMutation.isPending, "Creating ontology");
  useActivity(deleteOntologyMutation.isPending, "Deleting ontology");

  return {
    ontologies: ontologiesQuery.data || [],
    ontologiesLoading: ontologiesQuery.isLoading,
    ontologiesError: ontologiesQuery.error,

    updateOntology: updateOntologyMutation.mutate,
    isUpdatingOntology: updateOntologyMutation.isPending,

    createOntology: createOntologyMutation.mutate,
    isCreatingOntology: createOntologyMutation.isPending,

    deleteOntology: deleteOntologyMutation.mutate,
    isDeletingOntology: deleteOntologyMutation.isPending,

    refetch: () => {
      ontologiesQuery.refetch();
    },
  };
};
