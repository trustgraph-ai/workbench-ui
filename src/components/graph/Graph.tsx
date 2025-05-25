import React, { useEffect, useRef, useState } from "react";

import { Box, Alert, Heading, HStack } from "@chakra-ui/react";

import { useResizeDetector } from "react-resize-detector";

import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";

import { useProgressStateStore } from "../../state/progress";
import { useSocket } from "../../api/trustgraph/socket";
import { useWorkbenchStateStore } from "../../state/workbench";
import {
  createSubgraph,
  updateSubgraph,
} from "../../utils/knowledge-graph-viz";
import GraphHelp from "./GraphHelp";
import { toaster } from "../ui/toaster";

import { system } from "../../theme";

const GraphView = () => {
  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  const socket = useSocket();

  const selected = useWorkbenchStateStore((state) => state.selected);

  const fgRef = useRef();

  const { width, height, ref } = useResizeDetector({});

  const [view, setView] = useState(undefined);

  useEffect(() => {
    if (!selected) return;

    const act = "Build subgraph: " + selected.label;
    addActivity(act);

    const sg = createSubgraph();

    updateSubgraph(socket, selected.uri, sg, addActivity, removeActivity)
      .then((sg) => {
        setView(sg);
        removeActivity(act);
      })
      .catch((err) => {
        console.log("Error: ", err);
        removeActivity(act);
        toaster.create({
          title: "Error: " + err.toString(),
          type: "error",
        });
      });
  }, [selected, addActivity, removeActivity, socket]);

  if (!selected) {
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
  }

  if (!view)
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

  const wrap = (s: string, w: number) =>
    s.replace(
      new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, "g"),
      "$1\n",
    );

  const nodeClick = (node) => {
    const act = "Update subgraph: " + node.label;
    addActivity(act);

    updateSubgraph(socket, node.id, view, addActivity, removeActivity)
      .then((sg) => {
        setView(sg);
        removeActivity(act);
      })
      .catch((err) => {
        removeActivity(act);
        console.log("Error: ", err);
        toaster.create({
          title: "Error: " + err.toString(),
          type: "error",
        });
      });
  };

  // Ideally this would be based on themes, but the 3d graph stuff
  // doesn't use CSS variables which is what the theme stuff is based
  // on.
  const borderColor = system.token("colors.gray.600");
  const backgroundColor = system.token("colors.gray.800");
  const nodeColor = system.token("colors.gray.100");
  const nodeTextColor = system.token("colors.yellow.300");
  const linkColor = system.token("colors.green.500");
  const linkTextColor = system.token("colors.tgBlue.300");
  const linkParticleColor = system.token("colors.tgGreen.600");

  return (
    <>
      <HStack mb={8}>
        <Heading variant="h5" component="div" sx={{ m: 0, p: 0 }}>
          {selected.label}
        </Heading>

        <GraphHelp />
      </HStack>

      <Box
        ref={ref}
        border="1px solid"
        borderColor={borderColor}
        width="calc(100% - 0.5rem)"
        height="calc(100% - 11rem)"
      >
        <ForceGraph3D
          width={width}
          height={height}
          graphData={view}
          nodeOpacity={0.8}
          nodeLabel="label"
          enableNodeDrag={true}
          nodeColor={nodeColor}
          backgroundColor={backgroundColor}
          nodeThreeObject={(node) => {
            const sprite = new SpriteText(wrap(node.label, 30));
            sprite.color = nodeTextColor;
            sprite.textHeight = 4;
            return sprite;
          }}
          onNodeClick={nodeClick}
          onNodeDragEnd={(node) => {
            node.fx = node.x;
            node.fy = node.y;
            node.fz = node.z;
          }}
          linkDirectionalArrowLength={2.5}
          linkDirectionalArrowRelPos={0.75}
          linkOpacity={0.6}
          linkColor={linkColor}
          linkWidth="2"
          linkThreeObjectExtend={true}
          linkThreeObject={(link) => {
            const sprite = new SpriteText(wrap(link.label, 30));
            sprite.color = linkTextColor;
            sprite.textHeight = 2.0;
            return sprite;
          }}
          linkPositionUpdate={(sprite, { start, end }) => {
            const middlePos = {
              x: start.x + (end.x - start.x) / 2,
              y: start.y + (end.y - start.y) / 2,
              z: start.z + (end.z - start.z) / 2,
            };
            Object.assign(sprite.position, middlePos);
          }}
          ref={fgRef}
          linkDirectionalParticleColor={() => linkParticleColor}
          linkDirectionalParticleWidth={1.4}
          linkHoverPrecision={2}
          onLinkClick={(link) => {
            if (fgRef.current != undefined) fgRef.current.emitParticle(link);
          }}
        />
      </Box>
    </>
  );
};

export default GraphView;
