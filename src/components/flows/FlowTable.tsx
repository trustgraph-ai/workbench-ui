
import React, { useEffect, useState } from 'react';

import { Table, Link } from '@chakra-ui/react';

import { useSocket } from '../../api/trustgraph/socket';

const FlowTable = () => {

    const [view, setView] = useState([]);

    const socket = useSocket();

    useEffect(() => {

        socket.getFlows().then(

            (ids) => {
                return Promise.all(
                    ids.map(
                        (id) => socket.getFlow(id).then(x => [id, x])
                    )
                );
            }
        ).then(
            x => setView(x)
        ).catch(
            (err) => console.log("Error:", err)
        );

    }, [socket]);

    const select = (row) => {
      console.log(row);
    }

    return (

          <Table.Root sx={{ minWidth: 450 }}
              aria-label="table of entities"
          >
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>ID</Table.ColumnHeader>
                <Table.ColumnHeader>Class name</Table.ColumnHeader>
                <Table.ColumnHeader>Description</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
                {
                    view.map((row : Row) => (
                        <Table.Row
                          key={row[0]}
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
                                  {row[0]}
                              </Link>
                            </Table.Cell>
                            <Table.Cell>
                                {row[1]["class-name"]}
                            </Table.Cell>
                            <Table.Cell>
                                {row[1].description}
                            </Table.Cell>
                        </Table.Row>
                    ))
                }
            </Table.Body>
          </Table.Root>
    );                    
}

export default FlowTable;

