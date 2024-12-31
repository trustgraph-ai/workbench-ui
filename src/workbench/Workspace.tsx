
import React from 'react';

import { Stack, Divider, Box } from '@mui/material';

import Toolbox from './Toolbox';
import Chat from './chat/Chat';
import Discover from './discover/Discover';
import EntityDetail from './entity/EntityDetail';
import EntityList from './EntityList';
import GraphView from './graph/GraphView';
import Load from './load/Load';

import { useWorkbenchStateStore } from './state/WorkbenchState';

const Tool : React.FC<{ tool : string}> = ({ tool }) => {
   if (tool == "chat") return <Chat/>;
   if (tool == "discover") return <Discover/>;
   if (tool == "entity") return <EntityDetail/>;
   if (tool == "graph") return <GraphView/>;
   if (tool == "load") return <Load/>;
}

const Workspace : React.FC = () => {

    const tool = useWorkbenchStateStore((state) => state.tool);

    return (

        <Stack
            direction="row" className="workspace"
                divider={
                    <Divider
                        sx={{m: '0.5rem'}}
                        orientation="vertical"
                        flexItem
                    />
                }
        >

            <Stack
                direction="column"
                divider={
                    <Divider
                        orientation="horizontal"
                        flexItem
                    />
                }
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

