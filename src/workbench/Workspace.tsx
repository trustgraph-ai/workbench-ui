
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
            <Tool tool={tool}/>
        </Stack>

    );

};

export default Workspace;

