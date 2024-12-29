
import React from 'react';

import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';

interface OperationProps {
    value : string,
    setValue : (value : string) => void;
}

const Operation : React.FC<OperationProps> = ({
    value, setValue,
}) => {

    return (
        <>

            <Box sx={{ m: 2 }}>

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

            </Box>

        </>

    );

}

export default Operation;

