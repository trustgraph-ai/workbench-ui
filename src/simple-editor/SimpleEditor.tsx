
import React from 'react';

import { Box } from '@mui/material';

import Banner from './Banner.tsx';
import Configuration from './configuration/Configuration.tsx';

import './SimpleEditor.scss';

const SimpleEditor: React.FC = () => {

    return (

        <Box className="editor">
            <Banner/>
            <Configuration/>
        </Box>

    );

};

export default SimpleEditor;

