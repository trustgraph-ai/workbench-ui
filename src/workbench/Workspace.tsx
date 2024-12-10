
import React, { useState} from 'react';

import { Stack } from '@mui/material';

import Toolbox from './Toolbox';
import Chat from './Chat';

const Tool : React.FC<{ tool : string}> = ({ tool }) => {
   if (tool == "chat") return <Chat/>;
}

const Workspace : React.FC = () => {

    const [tool, setTool] = useState<string>("chat");

    return (

        <Stack direction="row">
            <Toolbox
                tool={tool} setTool={setTool}
            />
            <Tool
                tool={tool}
                sx={{ minWidth: '40rem', maxWidth: '90rem' }}
            />
        </Stack>

    );

};

export default Workspace;

