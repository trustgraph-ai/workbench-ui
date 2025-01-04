
import React from 'react';

import  Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useProgressStateStore } from './state/ProgressState';

const CenterSpinner : React.FC = () => {

    const activity = useProgressStateStore((state) => state.activity);

    if (activity.size < 1) return null;

    return (
        <Box
            sx={{
                position: 'absolute',
                top: 'calc(50% - 3rem)',
                left: 'calc(50% - 3rem)',
                zIndex: 999,
                m: 0,
                p: 0,
            }}
        >
                <CircularProgress size="6rem"/>
        </Box>
    );

}

export default CenterSpinner;

