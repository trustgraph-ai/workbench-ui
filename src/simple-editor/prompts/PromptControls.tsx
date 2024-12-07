
import React from 'react';

import { Box, Button } from '@mui/material';
import { List, ListItemButton, ListItemText } from '@mui/material';
import { ListItemIcon } from '@mui/material';
import { ChatBubble, Add } from '@mui/icons-material';

import { usePromptsStore } from '../state/Prompts';

interface PromptControlsProps {
    selected : string;
    handleSelect : (
        _event : React.MouseEvent<HTMLDivElement, MouseEvent>,
        id : string,
    ) => void;
    addPrompt : () => void;
}

const PromptControls : React.FC <PromptControlsProps> = ({
    selected, handleSelect, addPrompt, 
}) => {

    const prompts = usePromptsStore((state) => state.prompts);

    return (

        <>

            <List
                component="nav" aria-label="prompts"
                sx={{ width: "18rem", overflow: "hidden" }}
            >

                {
                    prompts.map(
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
                    onClick={ addPrompt }
                >
                    Add prompt
                </Button>

            </Box>

        </>
    );

}

export default PromptControls;
