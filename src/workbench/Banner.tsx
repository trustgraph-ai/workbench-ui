
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
                    <img
                        src="/tg.svg"
                        alt="Trustgraph logo"
                        height="45"
                    />
                    <Box
                        sx={{
                            position: 'relative',
                            top: '0',
                            left: '0',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '-2.8rem',
                                left: '0.41rem',
                            }}
                           
                        >
                        {
                            (activity.size > 0) &&
                            <CircularProgress
                                size="2rem"
                                sx={{ color: 'white' }}
                            />
                        }
                        </Box>
                    </Box>
                </Box>
                <Typography variant="h4" component="h1">
                    Data Workbench
                </Typography>
        </Stack>
    );

}

export default Banner;

