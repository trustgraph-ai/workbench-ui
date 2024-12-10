
import React from 'react';

import { List, ListItem, ListItemText, Avatar } from '@mui/material';
import { Search } from '@mui/icons-material';

import { Entity } from './state/Entity';

interface EntityListProps {
    entities: Entity[];
}

const EntityList : React.FC <EntityListProps> = ({
    entities
}) => {

    return (
        <List sx={{ height: '30rem', width: '20rem', overflowY: 'auto' }}>
            {entities.map((entity, ix) => {

                return (
                    <ListItem
                        key={ix}
                    >
                        <Avatar
                            sx={{ bgcolor: 'primary.main', mr: 2 }}
                        >
                            <Search/>
                        </Avatar>

                        <ListItemText
                            primary={entity.label}
                        />
                   </ListItem>
             )})}
        </List>
    );

}

export default EntityList
