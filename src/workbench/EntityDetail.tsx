
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
            <div>
                {selected && <div>
                    {selected.label} {selected.uri}
                    </div>}
                {(selected === undefined) ? <div>Nothing selected</div> : null}
            </div>
        </>

    );

}

export default EntityDetail;

