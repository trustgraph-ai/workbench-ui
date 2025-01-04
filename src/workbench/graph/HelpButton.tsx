
import React, { useState } from 'react';

import IconButton from '@mui/material/IconButton';
import Help from '@mui/icons-material/Help';

import GraphHelp from './Help';

const GraphView : React.FC <{}> = ({}) => {

    const [help, setHelp] = useState<boolean>(false);

    return (
        <>
            <IconButton
                aria-label="help"
                color="primary"
                size="large"
                onClick={() => setHelp(true)}
            >
                <Help fontSize="inherit"/>
            </IconButton>

            <GraphHelp
                open={help} onClose={() => setHelp(false)}
            />

        </>
    );

}

export default GraphView;

