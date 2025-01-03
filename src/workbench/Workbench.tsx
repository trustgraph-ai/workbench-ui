
import React from 'react';
import { useTheme } from '@mui/material/styles';

import { Box, Typography, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';

import Banner from './Banner.tsx';
import Workspace from './Workspace.tsx';

import { useProgressStateStore } from './state/ProgressState';

import './Workbench.scss';

import { SocketProvider } from './socket/SocketProvider';

const Workbench : React.FC = () => {

    const activity = useProgressStateStore((state) => state.activity);

    const theme = useTheme();
    const translucentBackground = alpha(theme.palette.background.paper, 0.6);

    return (

        <SocketProvider>

            <Box className="workbench">

                {
                    (activity.size > 0) && 
                    <Paper elevation={1}
                        sx={{
                            position: 'absolute',
                            bottom: '2rem',
                            left: '2rem',
                            zIndex: 999,
                            pt: '0.8rem',
                            pb: '0.8rem',
                            pl: '1.2rem',
                            pr: '1.2rem',
                            backgroundColor: translucentBackground,
                            border: 1,
                            borderColor: "grey.500",
                            borderRadius: 2,
                            width: "40rem",
                        }}
                    >
                            {
                                Array.from(activity).slice(0, 4).map(
                                    (a, ix) =>
                                        <Typography
                                            key={ix}
                                            variant="body2"
                                            color="grey.500"
                                            noWrap
                                        >
                                             {a}...
                                        </Typography>
                                )
                            }
                    </Paper>
                }
                <Banner/>
                <Workspace/>

            </Box>

        </SocketProvider>
    );

};

export default Workbench;

