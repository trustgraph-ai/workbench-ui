
import React, { useState, useEffect } from 'react';

import { Typography, Box, Stack, Button } from '@mui/material';

import { ArrowForward } from '@mui/icons-material';

import { useSocket } from './socket/socket';
import { useWorkbenchStateStore } from './state/WorkbenchState';
import { getTriples } from './state/knowledge-graph';

import { Entity } from './state/Entity';

interface EntityDetailProps {
}

const LiteralNode : React.FC<{value : Entity}> = ({value}) => {
    return (
        <Typography
            variant="body1"
            sx={{
                ml: '0.5rem',
                mr: '0.5rem',
                mt: '0.01rem',
                mb: '0.01rem',
                p: '0.01rem',
            }}
        >
            {value.label}
        </Typography>
    );
};

const SelectedNode : React.FC<{value : Entity}> = ({value}) => {

    return (
        <Typography
            variant="body1" color="#802030"
            sx={{
                ml: '0.5rem',
                mr: '0.5rem',
                p: '0',
            }}
        >
            {value.label}
        </Typography>
    );
};

const EntityNode : React.FC<{value : Entity}> = ({value}) => {

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
                () => setSelected({ uri: value.uri, label: value.label })
            }
        >
            {value.label}
        </Button>
    );
};

const EntityDetail : React.FC <EntityDetailProps> = ({
}) => {

    const socket = useSocket();

    const selected = useWorkbenchStateStore((state) => state.selected);
    const setTool = useWorkbenchStateStore((state) => state.setTool);

    if (!selected) {
        return ( <div>No node selected.</div> );
    }

    const [detail, setDetail] = useState<any>(undefined);

    const graphView = () => {
        setTool("graph");
    };

    useEffect(() => {

        getTriples(socket, selected.uri).then(
            (d) => {
                setDetail(d);
            }
        );

    }, [selected]);

    if (!detail)
        return ( <div>No data.</div> );

    return (
        <>
            <Typography variant="h5" component="div" gutterBottom>
                {selected.label}
            </Typography>

            <Button
                variant="outlined"
                onClick={()=> graphView()}
            >
                Graph view
            </Button>

            <Box>

                { detail.triples.map(
                     (t : any) => {
                         return (
                             <Box key={t.s.v + '//' + t.p.v + '//' + t.o.v}>
                                 <Stack
                                     direction="row"
                                     alignItems="center"
                                     gap={0}
                                 >

                                     {
                                         (t.s.v == selected.uri) ?
                                         <SelectedNode value={t.s}/> :
                                         <EntityNode value={t.s}/>
                                     }

                                     <ArrowForward/>

                                     {
                                         (t.p.v == selected.uri) ?
                                         <SelectedNode value={t.p}/> :
                                         <EntityNode value={t.p}/>
                                     }

                                     <ArrowForward/>

                                     {
                                         t.o.e ?
                                         (
                                             (t.o.v == selected.uri) ?
                                             <SelectedNode value={t.o}/> :
                                             <EntityNode value={t.o}/>
                                         ) :
                                         <LiteralNode value={t.o}/>
                                     }

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

