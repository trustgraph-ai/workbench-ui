
import React from 'react';

import { Stack, Divider, Box } from '@mui/material';

import Toolbox from './Toolbox';
import Chat from './Chat';
import EntityDetail from './EntityDetail';
import EntityList from './EntityList';
import GraphView from './GraphView';

import { useWorkbenchStateStore } from './state/WorkbenchState';

const Tool : React.FC<{ tool : string}> = ({ tool }) => {
   if (tool == "chat") return <Chat/>;
   if (tool == "entity") return <EntityDetail/>;
   if (tool == "graph") return <GraphView/>;
}

const Workspace : React.FC = () => {

    const tool = useWorkbenchStateStore((state) => state.tool);

    return (

        <Stack
            direction="row" className="workspace"
        >

            <Stack
                direction="column"
                divider={<Divider orientation="horizontal" flexItem/>}
            >
                <Toolbox/>
                <EntityList/>
            </Stack>
            <Box
                className="toolspace"
                sx={{ width: '100%' }}
            >
                <Tool tool={tool}/>
            </Box>
        </Stack>

    );

};

export default Workspace;

