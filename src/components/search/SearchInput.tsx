
import React, { useState } from 'react';

import { CircleHelp } from 'lucide-react';

import { Box, IconButton, Input, HStack } from '@chakra-ui/react';

import { useProgressStateStore } from '../../state/ProgressState';
import { useSearchStateStore } from '../../state/SearchState';
import SearchHelp from './SearchHelp';
import ProgressSubmitButton from '../common/ProgressSubmitButton';

interface SearchInputProps {
    submit : React.FormEventHandler<HTMLFormElement>;
}

const SearchInput : React.FC <SearchInputProps> = ({
    submit,
}) => {

  const activity = useProgressStateStore((state) => state.activity);

  const [help, setHelp] = useState<boolean>(false);

  const search = useSearchStateStore((state) => state.input);
  const setSearch = useSearchStateStore((state) => state.setInput);

  return (
    <>

        <form onSubmit={submit} >

          <HStack>

            <Input
              variant="outline"
              placeholder="Perform a vector search on a term or phrase..."
              value={search}
              onChange={ (e) => setSearch(e.target.value) }
            />

            <ProgressSubmitButton
                disabled={activity.size > 0}
                working={activity.size > 0}
            />

            <SearchHelp />

          </HStack>

        </form>

    </>

  );

}

export default SearchInput;

