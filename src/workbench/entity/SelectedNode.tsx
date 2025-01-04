
import React from 'react';

import { Typography } from '@mui/material';

import { Value } from '../state/Triple';

const SelectedNode : React.FC<{value : Value}> = ({value}) => {

    return (
        <Typography
            variant="body1" color="secondary.light"
            sx={{
                ml: '0.5rem',
                mr: '0.5rem',
                p: '0',
            }}
        >
            {value.label}
        </Typography>
    );
};

export default SelectedNode;

