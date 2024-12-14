
import React, { useState, useEffect, ReactNode } from 'react';

import { Typography, Box, Stack } from '@mui/material';

import { ArrowForward, ArrowBack } from '@mui/icons-material';

import { useSocket } from './socket/socket';
import { useWorkbenchStateStore } from './state/WorkbenchState';
import { getView } from './state/graph-algos';

interface EntityDetailProps {
}

const Literal : React.FC<{value : any}> = ({value}) => {
    return (
        <Typography variant="body1">
            {value.label}
        </Typography>
    );
};

const Entity : React.FC<{value : any}> = ({value}) => {
    return (
        <Typography variant="body1">
            {value.label}
        </Typography>
    );
};

const EntityDetail : React.FC <EntityDetailProps> = ({
}) => {

    const socket = useSocket();

    const selected = useWorkbenchStateStore((state) => state.selected);

    if (!selected) {
        return ( <div>No node selected.</div> );
    }

    const [view, setView] = useState<any>(undefined);
    const [stuff, setStuff] = useState<string>("");

    useEffect(() => {

        getView(socket, selected.uri).then(
            (d) => {
                setView(d);
                setStuff(JSON.stringify(d, null, 4));
            }
        );

    }, [selected]);

    if (!view)
        return ( <div>No data.</div> );

 console.log(view);
    return (
        <>
            <Typography variant="h5" component="div" gutterBottom>
                {selected.label}
            </Typography>

            <Box>
                { view.props.map(
                     (prop, ix) => {
                         return (
                             <Box key={'prop' + ix.toString()}>
                                 <Stack
                                     direction="row"
                                     alignItems="center"
                                     gap={0}
                                 >
                                     <Entity value={prop.prop}/>
                                     <Typography variant="body1">
                                         :
                                     </Typography>
                                     <Literal value={prop.value}/>
                                 </Stack>
                             </Box>
                         );
                     }
                )}

                { view.in.map(
                     (rel, ix) => {
                         return (
                             <Box key={'rel' + ix.toString()}>
                                 <Stack
                                     direction="row"
                                     alignItems="center"
                                     gap={0}
                                 >
                                     <Entity value={rel.rel}/>
                                     <ArrowBack/>
                                     <Entity value={rel.entity}/>
                                 </Stack>
                             </Box>
                         );
                     }
                )}

                { view.out.map(
                     (rel, ix) => {
                         return (
                             <Box key={'out' + ix.toString()}>
                                 <Stack
                                     direction="row"
                                     alignItems="center"
                                     gap={0}
                                 >
                                     <Entity value={rel.rel}/>
                                     <ArrowForward/>
                                     <Entity value={rel.entity}/>
                                 </Stack>
                             </Box>
                         );
                     }
                )}

            </Box>

        </>

    );

}

export default EntityDetail;

