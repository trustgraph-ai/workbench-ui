
import React from 'react';

import Box from '@mui/material/Box';

import Banner from './Banner.tsx';
import Workspace from './Workspace.tsx';
import './Workbench.scss';
import Progress from './Progress';
import Error from './Error';

import { SocketProvider } from './socket/SocketProvider';

const Workbench : React.FC = () => {

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

