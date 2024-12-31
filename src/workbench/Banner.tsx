
import React from 'react';

import { Typography, Box, Stack, CircularProgress } from '@mui/material';

import { useProgressStateStore } from './state/ProgressState';

const Banner : React.FC = () => {

    const activity = useProgressStateStore((state) => state.activity);

    return (

        <Stack
            className="banner"
            alignItems="center"
            direction="row"
            gap={2}
            sx={{ mb: 3 }}
        >
                <Box>
                    <img src="/tg.svg" alt="Trustgraph logo"
                        height="45"/>
                </Box>
                <Typography variant="h4" component="h1">
                    TrustGraph Data Workbench
                </Typography>
                <Box>
                { (activity.size > 0) &&
                    <Box>
                    stuff happening
                    <br/>
                    { Array.from(activity).join(" + ") }
                    </Box>
                }
                </Box>
                <Box>
                { (activity.size > 0) &&
                    <CircularProgress size="2rem"/>
                }
                </Box>
        </Stack>
    );

}

export default Banner;

