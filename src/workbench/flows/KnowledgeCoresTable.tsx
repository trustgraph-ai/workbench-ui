
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

const KnowledgeCoresTable : React.FC<{}> = ({
}) => {

    const [view, setView] = useState<any[]>([]);

    const socket = useSocket();

    useEffect(() => {

        socket.getKnowledgeCores().then(
            x => setView(x.map(x => { return { id: x }}))
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
              </TableRow>
            </TableHead>
            <TableBody>
                {
                    view.map((row : Row) => (
                        <TableRow
                          key={row.id}
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
                                  {row.id}
                              </Link>
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
          </Table>
        </TableContainer>
    );                    
}

export default KnowledgeCoresTable;

