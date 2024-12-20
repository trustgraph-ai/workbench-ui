
import React from 'react';

import { Typography, Box, Stack } from '@mui/material';

const Banner : React.FC = () => {

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
                    TrustGraph Workbench
                </Typography>
        </Stack>
    );

}

export default Banner;

