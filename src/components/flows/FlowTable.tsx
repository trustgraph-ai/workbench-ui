
import React, { useEffect, useState } from 'react';

import { Table, Link } from '@chakra-ui/react';

import { useWorkbenchStateStore } from '../../state/WorkbenchState';
import { useSearchStateStore } from '../../state/SearchState';
import { Row } from '../../state/row';

import { useSocket } from '../../api/trustgraph/socket';

const FlowTable : React.FC<{}> = ({
}) => {

    const [view, setView] = useState<any[]>([]);

    const socket = useSocket();

    useEffect(() => {

        socket.getFlows().then(

            (ids : string[]) : any => {
                return Promise.all<any>(
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



    }, []);

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

