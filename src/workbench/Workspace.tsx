
import React from 'react';

import { Stack, Divider, Box } from '@mui/material';

import Toolbox from './Toolbox';
import Chat from './Chat';
import EntityDetail from './EntityDetail';
import EntityList from './EntityList';

import { useWorkbenchStateStore } from './state/WorkbenchState';

const Tool : React.FC<{ tool : string}> = ({ tool }) => {
   if (tool == "chat") return <Chat/>;
   if (tool == "entity") return <EntityDetail/>;
}

const Workspace : React.FC = () => {

    const tool = useWorkbenchStateStore((state) => state.tool);

    return (

        <Stack direction="row">
            <Stack
                direction="column"
                divider={<Divider orientation="horizontal" flexItem />}
            >
                <Toolbox/>
                <EntityList/>
            </Stack>
            <Box>
                <Tool
                    tool={tool}
                />
            </Box>
        </Stack>

    );

};

export default Workspace;

