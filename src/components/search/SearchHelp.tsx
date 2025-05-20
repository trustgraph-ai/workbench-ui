
import React from 'react';

import { Popover, Text, IconButton, Portal } from '@chakra-ui/react';
import { CircleHelp } from 'lucide-react';

const SearchHelp = () => {

    return (
      <Popover.Root size="md" variant="outline">
        <Popover.Trigger asChild>
          <IconButton size="lg" ml={10}>
            <CircleHelp />
          </IconButton>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content w="25rem">
              <Popover.Arrow />
              <Popover.Body p={5}>
                <Popover.Title fontWeight="medium">Search</Popover.Title>
                <Text m={2}>
                  The Search assistant lets you enter terms for
                  semantic matching against known entities in the
                  knowledge graph.  Just enter a natural language
                  term, and the search assistant will find things
                  that closely match what you enter.
                </Text>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    );

}

export default SearchHelp;

