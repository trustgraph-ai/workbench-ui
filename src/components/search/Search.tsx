// Import state management hooks for different parts of the application
import { useState } from "react";
import { useWorkbenchStateStore } from "../../state/workbench";
import { useSearchStateStore } from "../../state/search";
import { useSessionStore } from "../../state/session";
import { useVectorSearch } from "../../state/vector-search";

// Import child components for search functionality
import SearchInput from "./SearchInput";
import Results from "./Results";
import { EmptyState } from "../common/TableStates";

/**
 * Main search component that handles vector search functionality
 * Combines search input and results display with state management
 */
const Search = () => {
  // Get vector search service instance
  const state = useVectorSearch();

  // Get current flow ID from session state
  const flowId = useSessionStore((state) => state.flowId);

  // Get function to update entities in workbench state
  const setEntities = useWorkbenchStateStore((state) => state.setEntities);

  // Get current search results and setter from search state
  const view = useSearchStateStore((state) => state.rows);
  const setView = useSearchStateStore((state) => state.setRows);

  // Get current search input from search state
  const search = useSearchStateStore((state) => state.input);

  // Track the last searched term separately from current input
  const [lastSearchedTerm, setLastSearchedTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  /**
   * Handles search submission by querying the vector search service
   * Updates both search results view and workbench entities on success
   */
  const submit = () => {
    console.log(search);

    // Mark that a search has been performed and store the search term
    setHasSearched(true);
    setLastSearchedTerm(search);

    // Perform vector search query with current flow, search term, and limit
    state
      .query({ flow: flowId, term: search, limit: 10 })
      .then((x) => {
        console.log(x);
        if (x) {
          // Update search results view
          setView(x.view);
          // Update workbench entities for potential visualization
          setEntities(x.entities);
        } else {
          // Handle empty search term case
          setView([]);
          setEntities([]);
        }
      })
      .catch((err) => console.log("Error:", err));
  };

  return (
    <>
      {/* Search input component with submit handler */}
      <SearchInput submit={submit} />

      {/* Show results if found, loading state, or empty state */}
      {state.isLoading ? (
        <EmptyState message="Searching..." />
      ) : view.length > 0 ? (
        <Results />
      ) : hasSearched && !state.isLoading ? (
        <EmptyState message={`No results found for "${lastSearchedTerm}"`} />
      ) : null}
    </>
  );
};

export default Search;
