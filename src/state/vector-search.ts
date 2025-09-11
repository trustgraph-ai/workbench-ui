import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { useSocket } from "../api/trustgraph/socket";
import { useNotification } from "./notify";
import { useSettings } from "./settings";
import { vectorSearch } from "../utils/vector-search";
import { useProgressStateStore } from "./progress";

/**
 * Custom hook for managing vector search operations
 * Provides functionality for searching entities using vector embeddings
 * @returns {Object} Vector search state and operations
 */

export const useVectorSearch = () => {
  // WebSocket connection for communicating with the configuration service
  const socket = useSocket();

  const addActivity = useProgressStateStore((state) => state.addActivity);

  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  // Hook for displaying user notifications
  const notify = useNotification();

  // Hook for accessing user settings
  const { settings } = useSettings();

  // State to track current search parameters
  const [searchParams, setSearchParams] = useState(null);

  /**
   * Query for fetching vector search results
   * Uses React Query for caching and background refetching
   */
  const searchQuery = useQuery({
    queryKey: ["search", searchParams, settings.collection],
    enabled: !!searchParams?.term,
    queryFn: () => {
      const { flow, term, limit } = searchParams;
      return vectorSearch(
        socket,
        flow || "default",
        addActivity,
        removeActivity,
        term,
        settings.collection,
        limit,
      )
        .then((x) => {
          if (x["error"]) {
            console.log("Error:", x);
            throw x.error.message;
          }
          return x;
        })
        .catch((err) => {
          console.log("Error:", err);
          notify.error(err);
          throw err;
        });
    },
  });

  // Function to trigger a new search
  const startSearch = ({ flow, term, limit }) => {
    if (!term) {
      setSearchParams(null);
      return;
    }
    setSearchParams({ flow: flow || "default", term, limit: limit || 10 });
  };

  // Return vector search state and operations for use in components
  return {
    // Function to start a new search
    startSearch: startSearch,
    // Search results and state
    data: searchQuery.data,
    isLoading: searchQuery.isLoading || searchQuery.isFetching,
    isError: searchQuery.isError,
    error: searchQuery.error,
    // Current search parameters
    searchParams: searchParams,
  };
};
