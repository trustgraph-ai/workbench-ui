
import React, { useState, useEffect } from 'react';

import { Typography, Box, Stack, Button, IconButton } from '@mui/material';

import { ArrowForward, ThreeDRotation, Help } from '@mui/icons-material';

import { useSocket } from '../socket/socket';
import { useWorkbenchStateStore } from '../state/WorkbenchState';
import { getTriples } from '../state/knowledge-graph';

import { Value } from '../state/Triple';

import { useProgressStateStore } from '../state/ProgressState';

import EntityHelp from './Help';

interface EntityDetailProps {
}

const LiteralNode : React.FC<{value : Value}> = ({value}) => {
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

const SelectedNode : React.FC<{value : Value}> = ({value}) => {

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

const EntityDetail : React.FC <EntityDetailProps> = ({
}) => {

    const addActivity = useProgressStateStore(
        (state) => state.addActivity
    );
    const removeActivity = useProgressStateStore(
        (state) => state.removeActivity
    );

    const socket = useSocket();

    const selected = useWorkbenchStateStore((state) => state.selected);
    const setTool = useWorkbenchStateStore((state) => state.setTool);

    if (!selected) {
        return ( <div>No node selected.</div> );
    }

    const [detail, setDetail] = useState<any>(undefined);

    const [help, setHelp] = React.useState<boolean>(false);

    const graphView = () => {
        setTool("graph");
    };

    useEffect(() => {

        const act = "Knowledge graph search: " + selected.label;
        addActivity(act);

        getTriples(socket, selected.uri, addActivity, removeActivity).then(
            (d) => {
                setDetail(d);
                removeActivity(act);
            }
        ).catch(
            (err) => {
                console.log("Error: ", err);
                removeActivity(act);
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

            <Box sx={{mt:2,mb:2}}>
                <Button
                    variant="contained"
                    startIcon={<ThreeDRotation/>}
                    onClick={()=> graphView()}
                >
                    Graph view
                </Button>
                <IconButton
                    aria-label="help"
                    color="primary"
                    size="large"
                    onClick={() => setHelp(true)}
                >
                    <Help fontSize="inherit"/>
                </IconButton>
            </Box>

            <EntityHelp
                open={help} onClose={() => setHelp(false)}
            />

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

