
import React from 'react';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';

import { Search } from '@mui/icons-material';
import { Entity } from './state/Entity';
import { useWorkbenchStateStore } from './state/WorkbenchState';

interface EntityListProps {
}

const EntityList : React.FC <EntityListProps> = ({
}) => {

    const entities = useWorkbenchStateStore((state) => state.entities);
    const selected = useWorkbenchStateStore((state) => state.selected);
    const setSelected = useWorkbenchStateStore((state) => state.setSelected);
    const setTool = useWorkbenchStateStore((state) => state.setTool);

    const onClick = (x : Entity) => {
        setSelected(x);
        setTool("entity");
    };

    return (
        <List
            className="entities"
            sx={{
                overflowY: 'auto', width: '18rem'
            }}>
            {entities.map((entity, ix) => {

                return (

                    <ListItemButton
                        key={ix}
                        selected={selected === entity}
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

