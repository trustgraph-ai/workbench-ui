
import React from 'react';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';

import ChatBubble from '@mui/icons-material/ChatBubble';
import Explore from '@mui/icons-material/Explore';
import ThreeDRotation from '@mui/icons-material/ThreeDRotation';
import InputIcon from '@mui/icons-material/Input';
import Search from '@mui/icons-material/Search';

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
                    key={'search'}
                    selected={tool == 'search'}
                    onClick={() => { setTool('search') }}
                >
                    <ListItemIcon>
                        <Search/>
                    </ListItemIcon>
                    <ListItemText primary={'Search'}/>
                </ListItemButton>

                <ListItemButton
                    key={'entity'}
                    selected={tool == 'entity'}
                    onClick={() => { setTool('entity') }}
                >
                    <ListItemIcon>
                        <Explore/>
                    </ListItemIcon>
                    <ListItemText primary="Explore"/>
                </ListItemButton>

                <ListItemButton
                    key={'graph'}
                    selected={tool == 'graph'}
                    onClick={() => { setTool('graph') }}
                >
                    <ListItemIcon>
                        <ThreeDRotation/>
                    </ListItemIcon>
                    <ListItemText primary="Visualize"/>
                </ListItemButton>

                <ListItemButton
                    key={'load'}
                    selected={tool == 'load'}
                    onClick={() => { setTool('load') }}
                >
                    <ListItemIcon>
                        <InputIcon />
                    </ListItemIcon>
                    <ListItemText primary="Load"/>
                </ListItemButton>

            </List>
                        
        </>

    );

}

export default Toolbox;

