
import React from 'react';

import Button from '@mui/material/Button';

import { useWorkbenchStateStore } from '../state/WorkbenchState';
import { Value } from '../state/Triple';

const EntityNode : React.FC<{value : Value}> = ({value}) => {

    const setSelected = useWorkbenchStateStore((state) => state.setSelected);

    return (
        <Button
            sx={{
                textTransform: 'initial',
                ml: '0.1rem',
                mr: '0.1rem',
                mt: '0.05rem',
                mb: '0.05rem',
                pl: '0.8rem',
                pr: '0.8rem',
                pt: '0.4rem',
                pb: '0.4rem',
            }}
            onClick={
                () => setSelected({
                    uri: value.v,
                    label: value.label ? value.label : value.v
                })
            }
        >
            {value.label}
        </Button>
    );
};

export default EntityNode;

