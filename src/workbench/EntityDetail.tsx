
import React, { useState } from 'react';

import { Stack } from '@mui/material';

import ChatConversation from './ChatConversation';
import EntityList from './EntityList';
import { Entity } from './state/Entity';

import { useWorkbenchStateStore } from './state/WorkbenchState';

interface EntityDetailProps {
}

const EntityDetail : React.FC <EntityDetailProps> = ({
}) => {

    const selected = useWorkbenchStateStore((state) => state.selected);

    return (
        <>
            {selected.label} {selected.uri}
        </>

    );

}

export default EntityDetail;

