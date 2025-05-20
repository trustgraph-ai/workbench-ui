
import React, { useEffect, useState } from 'react';

import { Table, Link } from '@chakra-ui/react';

import { Row } from '../state/row';

import { useSocket } from '../../api/trustgraph/socket';

const DocumentTable : React.FC<{}> = ({
}) => {

    const [view, setView] = useState<any[]>([]);

    const socket = useSocket();

    useEffect(() => {

        socket.getLibraryDocuments().then(
            x => setView(x)
        ).catch(
            (err) => console.log("Error:", err)
        );



    }, []);

    return (

          <Table.Root sx={{ minWidth: 450 }}
              aria-label="table of entities"
          >
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Title</Table.ColumnHeader>
                <Table.ColumnHeader>Time</Table.ColumnHeader>
                <Table.ColumnHeader>Description</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
                {
                    view.map((row : Row) => (
                        <Table.Row
                          key={row.id}
                          sx={{
                              '&:last-child td': { border: 0 },
                              '&:last-child th': { border: 0 }
                          }}
                        >
                            <Table.Cell component="th" scope="row">
                              <Link
                                  align="left"
                                  component="button"
                                  onClick={
                                      () => select(row)
                                  }
                              >
                                  {row.title}
                              </Link>
                            </Table.Cell>
                            <Table.Cell>
                                {row.time}
                            </Table.Cell>
                            <Table.Cell>
                                {row.comments}
                            </Table.Cell>
                        </Table.Row>
                    ))
                }
            </Table.Body>
          </Table.Root>
    );                    
}

export default DocumentTable;

