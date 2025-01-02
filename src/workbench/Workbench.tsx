
import React from 'react';

import { Box, CircularProgress, Typography } from '@mui/material';

import Banner from './Banner.tsx';
import Workspace from './Workspace.tsx';

import { useProgressStateStore } from './state/ProgressState';

import './Workbench.scss';

import { SocketProvider } from './socket/SocketProvider';

const Workbench : React.FC = () => {

    const activity = useProgressStateStore((state) => state.activity);

    return (

        <SocketProvider>
            <Box className="workbench">
                {
                    (activity.size > 0) && 
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: '2rem',
                            left: '2rem',
                            zIndex: 999,
                            m: 0,
                            pt: '0.8rem',
                            pb: '0.8rem',
                            pl: '1.2rem',
                            pr: '1.2rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            color: 'secondary',
                            border: '1px solid #c0c080',
                        }}
                    >
                            {
                                Array.from(activity).slice(0, 4).map(
                                    (a, ix) =>
                                        <Typography
                                            key={ix}
                                            variant="body1"
                                            sx={{ fontSize: 12 }}
                                        >
                                             {a}...
                                        </Typography>
                                )
                            }
                    </Box>
                }
                <Banner/>
                <Workspace/>
            </Box>
        </SocketProvider>

    );

};

export default Workbench;

