
import React, { useEffect, useState } from 'react';

import { Table, Link } from '@chakra-ui/react';

import { useSocket } from '../../api/trustgraph/socket';

const ProcessingTable = () => {

    const [view, setView] = useState([]);

    const socket = useSocket();

    useEffect(() => {

        socket.getLibraryProcessing().then(
            x => setView(x)
        ).catch(
            (err) => console.log("Error:", err)
        );



    }, [socket]);

    const select = (row) => {
        setSelected({ uri: row.uri, label: row.label ? row.label : "n/a" });
        setTool("entity");
    }

    return (

          <Table.Root sx={{ minWidth: 450 }}
              aria-label="table of entities"
          >
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>ID</Table.ColumnHeader>
                <Table.ColumnHeader>Time</Table.ColumnHeader>
                <Table.ColumnHeader>Document</Table.ColumnHeader>
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
                                  {row.id}
                              </Link>
                            </Table.Cell>
                            <Table.Cell>
                                {row.time}
                            </Table.Cell>
                            <Table.Cell>
                                {row["document-id"]}
                            </Table.Cell>
                        </Table.Row>
                    ))
                }
            </Table.Body>
          </Table.Root>
    );                    
}

export default ProcessingTable;

