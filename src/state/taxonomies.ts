import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { useSocket } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useActivity } from "./activity";

export interface TaxonomyMetadata {
  name: string;
  description: string;
  version: string;
  created: string;
  modified: string;
  creator: string;
  namespace: string;
}

export interface TaxonomyConcept {
  id: string;
  prefLabel: string;
  altLabel?: string[];
  hiddenLabel?: string[];
  definition?: string;
  scopeNote?: string;
  example?: string[];
  notation?: string;
  broader?: string | null;
  narrower?: string[];
  related?: string[];
  topConcept?: boolean;
  editorialNote?: string[];
  changeNote?: string[];
  historyNote?: string[];
}

export interface TaxonomyScheme {
  uri: string;
  prefLabel: string;
  hasTopConcept: string[];
}

export interface Taxonomy {
  metadata: TaxonomyMetadata;
  concepts: Record<string, TaxonomyConcept>;
  scheme: TaxonomyScheme;
}

export const useTaxonomies = () => {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const notify = useNotification();

  const taxonomiesQuery = useQuery({
    queryKey: ["taxonomies"],
    queryFn: () => {
      return socket
        .config()
        .getValues("taxonomy")
        .then((values) => {
          return values.map((item) => [item.key, JSON.parse(item.value)]);
        })
        .catch((err) => {
          console.log("Error:", err);
          throw err;
        });
    },
  });

  const updateTaxonomyMutation = useMutation({
    mutationFn: ({ id, taxonomy, onSuccess }: { 
      id: string; 
      taxonomy: Taxonomy; 
      onSuccess?: () => void;
    }) => {
      return socket
        .config()
        .putConfig([
          {
            type: "taxonomy",
            key: id,
            value: JSON.stringify(taxonomy),
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
      queryClient.invalidateQueries({ queryKey: ["taxonomies"] });
      notify.success("Taxonomy updated");
    },
  });

  const createTaxonomyMutation = useMutation({
    mutationFn: ({ id, taxonomy, onSuccess }: {
      id: string;
      taxonomy: Taxonomy;
      onSuccess?: () => void;
    }) => {
      return socket
        .config()
        .putConfig([
          {
            type: "taxonomy",
            key: id,
            value: JSON.stringify(taxonomy),
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
      queryClient.invalidateQueries({ queryKey: ["taxonomies"] });
      notify.success("Taxonomy created");
    },
  });

  const deleteTaxonomyMutation = useMutation({
    mutationFn: ({ id, onSuccess }: {
      id: string;
      onSuccess?: () => void;
    }) => {
      return socket
        .config()
        .deleteConfig([
          {
            type: "taxonomy",
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
      queryClient.invalidateQueries({ queryKey: ["taxonomies"] });
      notify.success("Taxonomy deleted");
    },
  });

  useActivity(taxonomiesQuery.isLoading, "Loading taxonomies");
  useActivity(updateTaxonomyMutation.isPending, "Updating taxonomy");
  useActivity(createTaxonomyMutation.isPending, "Creating taxonomy");
  useActivity(deleteTaxonomyMutation.isPending, "Deleting taxonomy");

  return {
    taxonomies: taxonomiesQuery.data || [],
    taxonomiesLoading: taxonomiesQuery.isLoading,
    taxonomiesError: taxonomiesQuery.error,

    updateTaxonomy: updateTaxonomyMutation.mutate,
    isUpdatingTaxonomy: updateTaxonomyMutation.isPending,

    createTaxonomy: createTaxonomyMutation.mutate,
    isCreatingTaxonomy: createTaxonomyMutation.isPending,

    deleteTaxonomy: deleteTaxonomyMutation.mutate,
    isDeletingTaxonomy: deleteTaxonomyMutation.isPending,

    refetch: () => {
      taxonomiesQuery.refetch();
    },
  };
};