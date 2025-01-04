
import React from 'react';

import Typography from '@mui/material/Typography';

import { Value } from '../state/Triple';

const LiteralNode : React.FC<{value : Value}> = ({value}) => {
    return (
        <Typography
            variant="body1"
            sx={{
                ml: '0.5rem',
                mr: '0.5rem',
                mt: '0.01rem',
                mb: '0.01rem',
                p: '0.01rem',
            }}
        >
            {value.label}
        </Typography>
    );
};

export default LiteralNode;

