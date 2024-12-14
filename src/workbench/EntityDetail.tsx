
import React, { useState, useEffect } from 'react';

import { Typography, Box, Stack } from '@mui/material';

import { ArrowForward, ArrowBack } from '@mui/icons-material';

import { useSocket } from './socket/socket';
import { useWorkbenchStateStore } from './state/WorkbenchState';
import { getView } from './state/graph-algos';

interface EntityDetailProps {
}

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
                                     <Typography variant="body1">
                                         {prop.prop.label}
                                     </Typography>
                                     <Typography variant="body1">
                                         :
                                     </Typography>
                                     <Typography variant="body1">
                                         {prop.value.label}
                                     </Typography>
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
                                     <Typography variant="body1">
                                         {rel.rel.label}
                                     </Typography>
                                     <ArrowBack/>
                                     <Typography variant="body1">
                                         {rel.entity.label}
                                     </Typography>
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
                                     <Typography variant="body1">
                                         {rel.rel.label}
                                     </Typography>
                                     <ArrowForward/>
                                     <Typography variant="body1">
                                         {rel.entity.label}
                                     </Typography>
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

