import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import { Rotate3d, ArrowBigRight } from "lucide-react";

import { Box, Alert, Button, Stack, Heading, HStack } from "@chakra-ui/react";

import { useSocket } from "../../api/trustgraph/socket";
import { useWorkbenchStateStore } from "../../state/WorkbenchState";
import { getTriples } from "../../state/knowledge-graph";
import { useProgressStateStore } from "../../state/ProgressState";

import EntityHelp from "./EntityHelp";
import ElementNode from "./ElementNode";

const EntityDetail = () => {
  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  const socket = useSocket();

  const navigate = useNavigate();

  const selected = useWorkbenchStateStore((state) => state.selected);

  const [detail, setDetail] = useState(undefined);

  useEffect(() => {
    if (!selected) return;

    const act = "Knowledge graph search: " + selected.label;
    addActivity(act);

    getTriples(socket, selected.uri, addActivity, removeActivity)
      .then((d) => {
        setDetail(d);
        removeActivity(act);
      })
      .catch((err) => {
        console.log("Error: ", err);
        removeActivity(act);
      });
  }, [selected, socket, addActivity, removeActivity]);

  if (!selected) {
    return (
      <Box>
        <Alert.Root severity="info" variant="outlined">
          <Alert.Indicator />
          <Alert.Title>
            No data to view. Try Chat or Search to find data.
          </Alert.Title>
        </Alert.Root>
      </Box>
    );
  }

  const graphView = () => {
    navigate("/graph");
  };

  if (!detail)
    return (
      <Box>
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
      <HStack mb={8}>
        <Heading>{selected.label}</Heading>

        <Box ml={8}>
          <Button size="md" variant="solid" onClick={() => graphView()}>
            <Rotate3d /> Graph view
          </Button>
        </Box>

        <EntityHelp />
      </HStack>

      <Box>
        {detail.triples.map((t) => {
          return (
            <Box key={t.s.v + "//" + t.p.v + "//" + t.o.v} mb={2}>
              <Stack direction="row" alignItems="center" gap={0}>
                <ElementNode value={t.s} selected={selected} />
                <ArrowBigRight />
                <ElementNode value={t.p} selected={selected} />
                <ArrowBigRight />
                <ElementNode value={t.o} selected={selected} />
              </Stack>
            </Box>
          );
        })}
      </Box>
    </>
  );
};

export default EntityDetail;
