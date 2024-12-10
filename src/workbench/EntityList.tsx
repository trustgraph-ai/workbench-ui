
import React from 'react';

import { List, ListItem, ListItemText } from '@mui/material';

import { Entity } from './state/Entity';

interface EntityListProps {
    entities: Entity[];
}

const EntityList : React.FC <EntityListProps> = ({
    entities
}) => {

    return (
        <List sx={{ height: '30rem', overflowY: 'auto' }}>
            {entities.map((entity, ix) => {

                return (
                    <ListItem
                        key={ix}
                    >
                        <ListItemText
                            primary={entity.label}
                        />
                   </ListItem>
             )})}
        </List>
    );

}

export default EntityList
