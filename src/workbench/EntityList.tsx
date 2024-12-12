
import React from 'react';

import { List, ListItemButton, ListItemText, Avatar } from '@mui/material';
import { Search } from '@mui/icons-material';

import { Entity } from './state/Entity';

import { useWorkbenchStateStore } from './state/WorkbenchState';

interface EntityListProps {
}

const EntityList : React.FC <EntityListProps> = ({
}) => {

    const entities = useWorkbenchStateStore((state) => state.entities);
    const setSelected = useWorkbenchStateStore((state) => state.setSelected);
    const setTool = useWorkbenchStateStore((state) => state.setTool);

    const onClick = (x : Entity) => {
        setSelected(x);
        setTool("entity");
    };

    return (
        <List sx={{ height: '30rem', width: '20rem', overflowY: 'auto' }}>
            {entities.map((entity, ix) => {

                return (

                    <ListItemButton
                        key={ix}
                        onClick={() => onClick(entity)}
                    >
                        <Avatar
                            sx={{ bgcolor: 'primary.main', mr: 2 }}
                        >
                            <Search/>
                        </Avatar>

                        <ListItemText
                            primary={entity.label}
                        />
                   </ListItemButton>
             )})}
        </List>
    );

}

export default EntityList

