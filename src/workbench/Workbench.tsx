
import React from 'react';

import { Box } from '@mui/material';

import Banner from './Banner.tsx';
import Workspace from './Workspace.tsx';

import './Workbench.scss';
import { SocketProvider } from './socket/SocketProvider';

const Workbench : React.FC = () => {

    return (

        <SocketProvider>
            <Box className="workbench">
                <Banner/>
                <Workspace/>
            </Box>
        </SocketProvider>

    );

};

export default Workbench;

