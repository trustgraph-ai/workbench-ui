
import React from 'react';

import { Box, CircularProgress } from '@mui/material';

import Banner from './Banner.tsx';
import Workspace from './Workspace.tsx';

import { useProgressStateStore } from './state/ProgressState';

import './Workbench.scss';
import { SocketProvider } from './socket/SocketProvider';

const Workbench : React.FC = () => {

    const addActivity = useProgressStateStore(
        (state) => state.addActivity
    );
    const removeActivity = useProgressStateStore(
        (state) => state.removeActivity
    );

    const activity = useProgressStateStore((state) => state.activity);

    return (

        <SocketProvider>
            <Box className="workbench">
            {
                (activity.size > 0) && 
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
            }

                <Banner/>
                <Workspace/>
            </Box>
        </SocketProvider>

    );

};

export default Workbench;

