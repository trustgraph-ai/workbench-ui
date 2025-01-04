
import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';

import Banner from './Banner.tsx';
import Workspace from './Workspace.tsx';
import { useProgressStateStore } from './state/ProgressState';
import './Workbench.scss';
import Progress from './Progress';
import Error from './Error';

import { SocketProvider } from './socket/SocketProvider';

const Workbench : React.FC = () => {

    const activity = useProgressStateStore((state) => state.activity);

    return (

        <SocketProvider>

            <Box className="workbench">
                <Progress/>
                <Error/>
                <Banner/>
                <Workspace/>
            </Box>

        </SocketProvider>
    );

};

export default Workbench;

