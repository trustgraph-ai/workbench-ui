
import { toaster } from "../ui/toaster";
import { useWorkbenchStateStore } from "../../state/workbench";
import { useSearchStateStore } from "../../state/search";
import { useSocket } from "../../api/trustgraph/socket";
import { vectorSearch } from "../../utils/vector-search";
import { useProgressStateStore } from "../../state/progress";
import { useSessionStore } from "../../state/session";

import SearchInput from "./SearchInput";
import Results from "./Results";

const Search = () => {
  const addActivity = useProgressStateStore((state) => state.addActivity);

  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  const socket = useSocket();
  const flowId = useSessionStore((state) => state.flowId);

  const setEntities = useWorkbenchStateStore((state) => state.setEntities);

  const view = useSearchStateStore((state) => state.rows);
  const setView = useSearchStateStore((state) => state.setRows);

  const search = useSearchStateStore((state) => state.input);

  const submit = () => {
    vectorSearch(socket, flowId, addActivity, removeActivity, search)
      .then((x) => {
        setView(x.view);
        setEntities(x.entities);
      })
      .catch((err) => {
        console.log("Error: ", err);
        toaster.create({
          title: "Error: " + err.toString(),
          type: "error",
        });
      });
  };

  return (
    <>
      <SearchInput submit={submit} />

      {view.length > 0 && <Results />}
    </>
  );
};

export default Search;
