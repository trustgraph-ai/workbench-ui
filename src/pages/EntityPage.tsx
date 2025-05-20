
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router";

import { Rotate3d, ArrowBigRight, Waypoints } from 'lucide-react';

import { Box, Alert, Button, Stack, Heading, HStack } from '@chakra-ui/react';

import { useSocket } from '../api/trustgraph/socket';
import { useWorkbenchStateStore } from '../state/WorkbenchState';
import { getTriples } from '../state/knowledge-graph';
import { useProgressStateStore } from '../state/ProgressState';

import EntityHelp from '../components/entity/Help';
import ElementNode from '../components/entity/ElementNode';
import CenterSpinner from '../components/common/CenterSpinner';
import PageHeader from '../components/common/PageHeader';

const EntityDetail = () => {

    const addActivity = useProgressStateStore(
        (state) => state.addActivity
    );
    const removeActivity = useProgressStateStore(
        (state) => state.removeActivity
    );

    const socket = useSocket();

    const navigate = useNavigate();

    const setError = useProgressStateStore((state) => state.setError);

    const selected = useWorkbenchStateStore((state) => state.selected);
    const setTool = useWorkbenchStateStore((state) => state.setTool);

    if (!selected) {
        return (
            <Box>
                <CenterSpinner/>
                <Alert.Root severity="info" variant="outlined">
                  <Alert.Indicator />
                  <Alert.Title>
                    No data to view. Try Chat or Search to find data.
                  </Alert.Title>
                </Alert.Root>
            </Box>
        );
    }

    const [detail, setDetail] = useState<any>(undefined);

    const graphView = () => {
        navigate("/graph");
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
                <Alert.Root status="info" variant="outline">
                  <Alert.Indicator />
                  <Alert.Title>
                    No data to view. Try Chat or Search to find data.
                  </Alert.Title>
                </Alert.Root>
            </Box>
        );

    return (
        <>

            <PageHeader
              icon={ <Waypoints /> }
              title="Explore"
              description="Exploring properties and relationships of the knowledge graph"
            />

            <CenterSpinner/>

            <HStack mb={8}>

              <Heading>
                {selected.label}
              </Heading>

              <Box ml={8}>
                <Button
                  size="md"
                  variant="solid"
                  onClick={()=> graphView()}
                >
                  <Rotate3d /> Graph view
                </Button>
              </Box>

              <EntityHelp />

            </HStack>

            <Box>

                { detail.triples.map(
                     (t : any) => {
                         return (
                             <Box key={t.s.v + '//' + t.p.v + '//' + t.o.v}
                               mb={2}
                             >
                                 <Stack
                                     direction="row"
                                     alignItems="center"
                                     gap={0}
                                 >

                                     <ElementNode
                                         value={t.s} selected={selected}
                                     />
                                     <ArrowBigRight />
                                     <ElementNode
                                         value={t.p} selected={selected}
                                     />
                                     <ArrowBigRight />
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

