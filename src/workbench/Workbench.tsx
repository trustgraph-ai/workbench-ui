
import React from 'react';

import { Box } from '@mui/material';

import Banner from './Banner.tsx';
import Workspace from './Workspace.tsx';

import './Workbench.scss';

const Workbench : React.FC = () => {

    return (

        <Box className="editor">
            <Banner/>
            <Workspace/>
        </Box>

    );

};

export default Workbench;

