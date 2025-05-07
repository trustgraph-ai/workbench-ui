
import React, { useEffect, useState } from 'react';

import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { useWorkbenchStateStore } from '../state/WorkbenchState';
import { useSearchStateStore } from '../state/SearchState';
import { Row } from '../state/row';

import { useSocket } from '../socket/socket';

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

        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table sx={{ minWidth: 450 }}
              aria-label="table of entities"
          >
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Class name</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {
                    view.map((row : Row) => (
                        <TableRow
                          key={row[0]}
                          sx={{
                              '&:last-child td': { border: 0 },
                              '&:last-child th': { border: 0 }
                          }}
                        >
                            <TableCell component="th" scope="row">
                              <Link
                                  align="left"
                                  component="button"
                                  onClick={
                                      () => select(row)
                                  }
                              >
                                  {row[0]}
                              </Link>
                            </TableCell>
                            <TableCell>
                                {row[1]["class-name"]}
                            </TableCell>
                            <TableCell>
                                {row[1].description}
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
          </Table>
        </TableContainer>
    );                    
}

export default FlowTable;

