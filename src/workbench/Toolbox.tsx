
import React from 'react';

import { List, ListItemButton, ListItemText } from '@mui/material';
import { ListItemIcon } from '@mui/material';
import { ChatBubble } from '@mui/icons-material';
import ExploreIcon from '@mui/icons-material/Explore';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';
import UploadFileIcon from '@mui/icons-material/UploadFile';

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
                    <ListItemText primary={'System Chat'}/>
                </ListItemButton>

                <ListItemButton
                    key={'entity'}
                    selected={tool == 'entity'}
                    onClick={() => { setTool('entity') }}
                >
                    <ListItemIcon>
                        <ExploreIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Data Explorer"/>
                </ListItemButton>

                <ListItemButton
                    key={'graph'}
                    selected={tool == 'graph'}
                    onClick={() => { setTool('graph') }}
                >
                    <ListItemIcon>
                        <ThreeDRotationIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Data Visualizer"/>
                </ListItemButton>

                <ListItemButton
                    key={'load'}
                    selected={tool == 'load'}
                    onClick={() => { setTool('load') }}
                >
                    <ListItemIcon>
                        <UploadFileIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Data Loader"/>
                </ListItemButton>

            </List>
                        
        </>

    );

}

export default Toolbox;

