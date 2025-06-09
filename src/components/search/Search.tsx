import { useWorkbenchStateStore } from "../../state/workbench";
import { useSearchStateStore } from "../../state/search";
import { useSessionStore } from "../../state/session";
import { useVectorSearch } from "../../state/vector-search";

import SearchInput from "./SearchInput";
import Results from "./Results";

const Search = () => {
  const state = useVectorSearch();

  const flowId = useSessionStore((state) => state.flowId);

  const setEntities = useWorkbenchStateStore((state) => state.setEntities);

  const view = useSearchStateStore((state) => state.rows);
  const setView = useSearchStateStore((state) => state.setRows);

  const search = useSearchStateStore((state) => state.input);

  const submit = () => {
    console.log(search);

    state
      .query({ flow: flowId, term: search, limit: 10 })
      .then((x) => {
        console.log(x);
        setView(x.view);
        setEntities(x.entities);
      })
      .catch((err) => console.log("Error:", err));
  };

  return (
    <>
      <SearchInput submit={submit} />

      {view.length > 0 && <Results />}
    </>
  );
};

export default Search;
