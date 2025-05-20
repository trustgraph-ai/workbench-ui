
import React from 'react';

import { Trash } from 'lucide-react';

import { Box, Table, IconButton } from '@chakra-ui/react';

import { useLoadStateStore } from '../../state/LoadState';

interface SelectedFilesProps {
}

const SelectedFiles : React.FC<SelectedFilesProps> = ({
}) => {

  const files = useLoadStateStore((state) => state.files);
  const removeFile = useLoadStateStore((state) => state.removeFile);

  return (
    <>
      <Box>
        <Table.Root width="30rem">
          <Table.Body>
            {
              Array.from(files).map(
                (file, ix) => (
                  <Table.Row key={ix}>
                    <Table.Cell>
                      {file.name}
                    </Table.Cell>
                    <Table.Cell>
                      <IconButton
                        onClick={() => removeFile(file)}
                      >
                        <Trash />
                      </IconButton>
                    </Table.Cell>
                  </Table.Row>
                )
              )
            }
          </Table.Body>
        </Table.Root>
      </Box>
    </>
  );

}

export default SelectedFiles;

