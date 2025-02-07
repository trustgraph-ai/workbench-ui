
import React, { useState } from 'react';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import Help from '@mui/icons-material/Help';

import { useLoadStateStore } from '../state/LoadState';

interface OperationProps {
}

import LoadHelp from './Help';

const Operation : React.FC<OperationProps> = ({
}) => {

    const [help, setHelp] = useState<boolean>(false);

    const value = useLoadStateStore((state) => state.operation);
    const setValue = useLoadStateStore((state) => state.setOperation);

    const setOperation = (op : string) => {
        if (op) setValue(op);
    };

    return (
        <>

            <Box
                sx={{
                    m: 2,
                    display: "flex",
                    alignItems: "center",
                }}
            >

                <ToggleButtonGroup
                  color="primary"
                  value={value}
                  exclusive
                  onChange={(_e, value) => setOperation(value)}
                  aria-label="Operation"
                >
                  <ToggleButton value="upload-pdf">
                      PDF
                  </ToggleButton>
                  <ToggleButton value="upload-text">
                      TEXT
                  </ToggleButton>
                  <ToggleButton value="paste-text">
                      Paste
                  </ToggleButton>
                </ToggleButtonGroup>

                <IconButton
                    aria-label="help"
                    color="primary"
                    size="large"
                    onClick={() => setHelp(true)}
                >
                    <Help fontSize="inherit"/>
                </IconButton>

            </Box>
            <LoadHelp
                open={help} onClose={() => setHelp(false)}
            />

        </>

    );

}

export default Operation;

