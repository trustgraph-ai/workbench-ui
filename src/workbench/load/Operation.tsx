
import React, { useEffect } from 'react';

import {
    ToggleButton, ToggleButtonGroup, Box, IconButton
} from '@mui/material';
import { Help } from '@mui/icons-material';

interface OperationProps {
    value : string,
    setValue : (value : string) => void;
}

import LoadHelp from './Help';

const Operation : React.FC<OperationProps> = ({
    value, setValue,
}) => {

    const [help, setHelp] = React.useState<boolean>(false);

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
                  onChange={(_e, value) => setValue(value)}
                  aria-label="Operation"
                >
                  <ToggleButton value="upload-pdf">
                      Upload PDF
                  </ToggleButton>
                  <ToggleButton value="upload-text">
                      Upload text
                  </ToggleButton>
                  <ToggleButton value="paste-text">
                      Paste text
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

