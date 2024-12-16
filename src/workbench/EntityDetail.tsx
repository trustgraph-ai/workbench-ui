
import React, { useState, useEffect } from 'react';

import { Typography, Box, Stack, Button } from '@mui/material';

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

const Selected : React.FC<{value : any}> = ({value}) => {

    return (
        <Typography variant="body1" color="#802030"
            sx={{
                maxWidth: '20rem',
            }}
        >
            {value.label}
        </Typography>
    );
};

const Entity : React.FC<{value : any}> = ({value}) => {

    const setSelected = useWorkbenchStateStore((state) => state.setSelected);

    return (
        <Button
            sx={{
                textTransform: 'initial',
                maxWidth: '20rem',
            }}
            onClick={ () => setSelected({ uri: value.v, label: value.label }) }
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

    const [view, setView] = useState<any>(undefined);

    const graphView = () => {
        setTool("graph");
    };

    useEffect(() => {

        getView(socket, selected.uri).then(
            (d) => {
                setView(d);
            }
        );

    }, [selected]);

    if (!view)
        return ( <div>No data.</div> );

////////////////////////////////////////////////////////////////////////////
// FIXME: These keys won't track change!
////////////////////////////////////////////////////////////////////////////

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

                { view.props.map(
                     (prop : any, ix : number) => {
                         return (
                             <Box key={'prop' + ix.toString()}>
                                 <Stack
                                     direction="row"
                                     alignItems="center"
                                     gap={0}
                                 >
                                     <Selected value={selected}/>
                                     <ArrowForward/>
                                     <Entity value={prop.prop}/>
                                     <ArrowForward/>
                                     <Literal value={prop.value}/>
                                 </Stack>
                             </Box>
                         );
                     }
                )}

                { view.in.map(
                     (rel : any, ix : number) => {
                         return (
                             <Box key={'rel' + ix.toString()}>
                                 <Stack
                                     direction="row"
                                     alignItems="center"
                                     gap={0}
                                 >
                                     <Selected value={selected}/>
                                     <ArrowForward/>
                                     <Entity value={rel.entity}/>
                                     <ArrowForward/>
                                     <Entity value={rel.rel}/>
                                 </Stack>
                             </Box>
                         );
                     }
                )}

                { view.out.map(
                     (rel : any, ix : number) => {
                         return (
                             <Box key={'out' + ix.toString()}>
                                 <Stack
                                     direction="row"
                                     alignItems="center"
                                     gap={0}
                                 >
                                     <Selected value={selected}/>
                                     <ArrowForward/>
                                     <Entity value={rel.rel}/>
                                     <ArrowForward/>
                                     <Entity value={rel.entity}/>
                                 </Stack>
                             </Box>
                         );
                     }
                )}

                { view.pred.map(
                     (rel : any, ix : number) => {
                         return (
                             <Box key={'pred' + ix.toString()}>
                                 <Stack
                                     direction="row"
                                     alignItems="center"
                                     gap={0}
                                 >
                                     <Entity value={rel.src}/>
                                     <ArrowForward/>
                                     <Selected value={rel.rel}/>
                                     <ArrowForward/>
                                     <Entity value={rel.dest}/>
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

