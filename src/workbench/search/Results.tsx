
import React from 'react';

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

const Results : React.FC<{}> = ({
}) => {

    const view = useSearchStateStore((state) => state.rows);

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
                <TableCell>Entity</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Similarity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {
                    view.map((row : Row) => (
                        <TableRow
                          key={row.uri}
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
                                  {row.label}
                              </Link>
                            </TableCell>
                            <TableCell>
                                {row.description}
                            </TableCell>
                            <TableCell>
                                {row.similarity!.toFixed(2)}
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
          </Table>
        </TableContainer>
    );                    
}

export default Results;

