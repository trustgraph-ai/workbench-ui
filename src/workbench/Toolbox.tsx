
import React from 'react';

import { List, ListItemButton, ListItemText } from '@mui/material';
import { ListItemIcon } from '@mui/material';
import {
    ChatBubble, Explore, ThreeDRotation, UploadFile, Search,
} from '@mui/icons-material';

import { useWorkbenchStateStore } from './state/WorkbenchState';

interface ToolboxProps {
};

const Toolbox : React.FC <ToolboxProps> = ({
}) => {

    const tool = useWorkbenchStateStore((state) => state.tool);
    const setTool = useWorkbenchStateStore((state) => state.setTool);

    return (

        <>

            <List
                className="toolbox"
                component="nav" aria-label="toolbox"
                sx={{ width: "18rem", mt: '1rem' }}
            >

                <ListItemButton
                    key={'chat'}
                    selected={tool == 'chat'}
                    onClick={() => { setTool('chat') }}
                >
                    <ListItemIcon>
                        <ChatBubble/>
                    </ListItemIcon>
                    <ListItemText primary={'Chat'}/>
                </ListItemButton>

                <ListItemButton
                    key={'discover'}
                    selected={tool == 'discover'}
                    onClick={() => { setTool('discover') }}
                >
                    <ListItemIcon>
                        <Search/>
                    </ListItemIcon>
                    <ListItemText primary={'Discover'}/>
                </ListItemButton>

                <ListItemButton
                    key={'entity'}
                    selected={tool == 'entity'}
                    onClick={() => { setTool('entity') }}
                >
                    <ListItemIcon>
                        <Explore/>
                    </ListItemIcon>
                    <ListItemText primary="Explorer"/>
                </ListItemButton>

                <ListItemButton
                    key={'graph'}
                    selected={tool == 'graph'}
                    onClick={() => { setTool('graph') }}
                >
                    <ListItemIcon>
                        <ThreeDRotation/>
                    </ListItemIcon>
                    <ListItemText primary="Visualizer"/>
                </ListItemButton>

                <ListItemButton
                    key={'load'}
                    selected={tool == 'load'}
                    onClick={() => { setTool('load') }}
                >
                    <ListItemIcon>
                        <UploadFile/>
                    </ListItemIcon>
                    <ListItemText primary="Loader"/>
                </ListItemButton>

            </List>
                        
        </>

    );

}

export default Toolbox;

