import React from "react";

import { Input, HStack } from "@chakra-ui/react";

import { useProgressStateStore } from "../../state/progress";
import { useSearchStateStore } from "../../state/search";
import SearchHelp from "./SearchHelp";
import ProgressSubmitButton from "../common/ProgressSubmitButton";

const SearchInput = ({ submit }) => {
  const activity = useProgressStateStore((state) => state.activity);

  const search = useSearchStateStore((state) => state.input);
  const setSearch = useSearchStateStore((state) => state.setInput);

  const handleKeyDown = (e) => {
    if (["Enter"].includes(e.key)) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <>
      <form onSubmit={submit}>
        <HStack>
          <Input
            variant="outline"
            placeholder="Perform a vector search on a term or phrase..."
            value={search}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />

          <ProgressSubmitButton
            disabled={activity.size > 0}
            working={activity.size > 0}
            onClick={() => submit()}
          />

          <SearchHelp />
        </HStack>
      </form>
    </>
  );
};

export default SearchInput;
