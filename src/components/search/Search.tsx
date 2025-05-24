
import SearchInput from './SearchInput';
import Results from './Results';

import { useProgressStateStore } from "../../state/ProgressState";
import { useSocket } from "../../api/trustgraph/socket";
import { useWorkbenchStateStore } from "../../state/WorkbenchState";
import { useSearchStateStore } from "../../state/SearchState";
import { vectorSearch } from '../../utils/vector-search';


const Search = () => {

  const addActivity = useProgressStateStore((state) => state.addActivity);

  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  const setError = useProgressStateStore((state) => state.setError);

  const socket = useSocket();

  const setEntities = useWorkbenchStateStore((state) => state.setEntities);

  const view = useSearchStateStore((state) => state.rows);
  const setView = useSearchStateStore((state) => state.setRows);

  const search = useSearchStateStore((state) => state.input);

  const submit: React.FormEventHandler<HTMLFormElement> = (e) => {

    vectorSearch(socket, addActivity, removeActivity, search).then(
      (x) => {
        setView(x.view);
        setEntities(x.entities);
      }
    ).catch((err) => {
        console.log("Error: ", err);
        toaster.create({
          title: "Error: " + err.toString(),
          type: "error",
        });
      });

    e.preventDefault();
  };

  return (
    <>
      <SearchInput submit={submit} />

      {view.length > 0 && <Results />}  
    </>
  );
};

export default Search;
