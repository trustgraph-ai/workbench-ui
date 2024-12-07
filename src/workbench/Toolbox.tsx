
import React from 'react';

import { List, ListItemButton, ListItemText } from '@mui/material';
import { ListItemIcon } from '@mui/material';
import { ChatBubble } from '@mui/icons-material';

interface ToolboxProps {
    tool : string;
    setTool : (tool : string) => void;
}

const Toolbox : React.FC <ToolboxProps> = ({
    tool, setTool,
}) => {

    return (

        <>

            <List
                component="nav" aria-label="toolbox"
                sx={{ width: "18rem" }}
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
                    key={'graph-rag'}
                    selected={tool == 'graph-rag'}
                    onClick={() => { setTool('graph-rag') }}
                >
                    <ListItemIcon>
                        <ChatBubble/>
                    </ListItemIcon>
                    <ListItemText primary="GraphRAG"/>
                </ListItemButton>

            </List>
                        
        </>

    );

}

export default Toolbox;

