
import React, { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ThreeDRotation from '@mui/icons-material/ThreeDRotation';
import Help from '@mui/icons-material/Help';

import { useSocket } from '../socket/socket';
import { useWorkbenchStateStore } from '../state/WorkbenchState';
import { getTriples } from '../state/knowledge-graph';
import { useProgressStateStore } from '../state/ProgressState';
import EntityHelp from './Help';
import ElementNode from './ElementNode';
import CenterSpinner from '../CenterSpinner';

interface EntityDetailProps {
}

const EntityDetail : React.FC <EntityDetailProps> = ({
}) => {

    const addActivity = useProgressStateStore(
        (state) => state.addActivity
    );
    const removeActivity = useProgressStateStore(
        (state) => state.removeActivity
    );

    const socket = useSocket();

    const setError = useProgressStateStore((state) => state.setError);

    const selected = useWorkbenchStateStore((state) => state.selected);
    const setTool = useWorkbenchStateStore((state) => state.setTool);

    if (!selected) {
        return (
            <Box>
                <CenterSpinner/>
                <Typography variant='h6' color='primary'>
                    No data to view. Try Chat or Search to find data.
                </Typography>
            </Box>
        );
    }

    const [detail, setDetail] = useState<any>(undefined);

    const [help, setHelp] = useState<boolean>(false);

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
                setError("");
            }
        ).catch(
            (err) => {
                console.log("Error: ", err);
                setError(err.toString());
                removeActivity(act);
            }
        );

    }, [selected]);

    if (!detail)
        return (
            <Box>
                <CenterSpinner/>
                <Typography variant='h6' color='primary'>
                    No data to view. Try Chat or Search to find data.
                </Typography>
            </Box>
        );

    return (
        <>

            <Typography variant="h5" component="div" gutterBottom>
                {selected.label}
            </Typography>

            <CenterSpinner/>

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

                                     <ElementNode
                                         value={t.s} selected={selected}
                                     />
                                     <ArrowForward/>
                                     <ElementNode
                                         value={t.p} selected={selected}
                                     />
                                     <ArrowForward/>
                                     <ElementNode
                                         value={t.o} selected={selected}
                                     />
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


