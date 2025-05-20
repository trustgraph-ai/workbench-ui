
import React, { useEffect, useState } from 'react';

import { Table, Link } from '@chakra-ui/react';

import { Row } from '../state/row';

import { useSocket } from '../../api/trustgraph/socket';

const TokenCostTable = () => {

    const [view, setView] = useState([]);

    const socket = useSocket();

    useEffect(() => {

        socket.getTokenCosts().then(
            x => setView(x)
        ).catch(
            (err) => console.log("Error:", err)
        );



    }, [socket]);

    const setSelected = useWorkbenchStateStore((state) => state.setSelected);

    const setTool = useWorkbenchStateStore((state) => state.setTool);

    const select = (row : Row) => {
        setSelected({ uri: row.uri, label: row.label ? row.label : "n/a" });
        setTool("entity");
    }

    return (

          <Table.Root sx={{ minWidth: 450 }}
              aria-label="table of entities"
          >
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Model</Table.ColumnHeader>
                <Table.ColumnHeader>Input ($/1Mt)</Table.ColumnHeader>
                <Table.ColumnHeader>Output ($/1Mt)</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
                {
                    view.map((row : Row) => (
                        <Table.Row
                          key={row.model}
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
                                  {row.model}
                              </Link>
                            </Table.Cell>
                            <Table.Cell>
                                {(row.input_price * 1000000).toFixed(3) }
                            </Table.Cell>
                            <Table.Cell>
                                {(row.output_price * 1000000).toFixed(3) }
                            </Table.Cell>
                        </Table.Row>
                    ))
                }
            </Table.Body>
          </Table.Root>

    );                    
}

export default TokenCostTable;

