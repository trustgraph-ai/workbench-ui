
import React from 'react';

import { Box, Button } from '@mui/material';
import { List, ListItemButton, ListItemText } from '@mui/material';
import { ListItemIcon } from '@mui/material';
import { ChatBubble, Add } from '@mui/icons-material';

import { useAgentsStore } from '../state/Agents';

interface AgentControlsProps {
    selected : string | null;
    handleSelect : (
        _event : React.MouseEvent<HTMLDivElement, MouseEvent>,
        id : string,
    ) => void;
    addTool : () => void;
}

const AgentControls : React.FC <AgentControlsProps> = ({
    selected, handleSelect, addTool, 
}) => {

    const tools = useAgentsStore((state) => state.tools);

    return (

        <>

            <List
                component="nav" aria-label="agents"
                sx={{ width: "18rem", overflow: "hidden" }}
            >

                {
                    tools.map(
                       p => {
                           return (
                               <ListItemButton
                                   key={p.id}
                                   selected={selected == p.id}
                                   onClick={(event) =>
                                       handleSelect(event, p.id)
                                   }
                               >
                                   <ListItemIcon>
                                       <ChatBubble/>
                                   </ListItemIcon>
                                   <ListItemText primary={p.name}/>
                               </ListItemButton>
                           );
                       }
                    )
                }
            </List>

            <Box>

                <Button
                    startIcon={<Add/>}
                    variant="contained"
                    onClick={ addTool }
                >
                    Add tool
                </Button>

            </Box>

        </>
    );

}

export default AgentControls;
