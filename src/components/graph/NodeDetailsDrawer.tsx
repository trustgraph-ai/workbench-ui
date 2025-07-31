import React from "react";
import { Drawer, Text, VStack, Heading, List } from "@chakra-ui/react";
import { X } from "lucide-react";

import { useNodeDetails } from "../../state/node-details";
import { useSessionStore } from "../../state/session";
import NodePropertiesTable from "./NodePropertiesTable";
import RelationshipsTable from "./RelationshipsTable";

interface NodeDetailsDrawerProps {
  node: {
    id: string;
    label: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const NodeDetailsDrawer: React.FC<NodeDetailsDrawerProps> = ({ node, isOpen, onClose }) => {
  const flowId = useSessionStore((state) => state.flowId);
  
  // Fetch node details directly in the drawer
  const { outboundRelationshipsWithLabels, inboundRelationshipsWithLabels, propertiesWithLabels, isLoading } = useNodeDetails(node?.id, flowId);
  return (
    <Drawer.Root 
      open={isOpen} 
      onOpenChange={(e) => {
        // Only call onClose when explicitly closing the drawer
        if (!e.open) {
          onClose();
        }
      }} 
      placement="end" 
      size="sm" 
      modal={false}
      closeOnInteractOutside={false}
    >
      <Drawer.Positioner style={{ pointerEvents: "none" }}>
        <Drawer.Content style={{ pointerEvents: "auto" }}>
          <Drawer.CloseTrigger asChild>
            <button
              style={{
                position: "absolute",
                right: "1rem",
                top: "1rem",
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: "0.5rem",
              }}
            >
              <X size={20} />
            </button>
          </Drawer.CloseTrigger>
          <Drawer.Header>
            <Drawer.Title>{node?.label || node?.id || 'Node Details'}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            {node && (
              <VStack align="start" spacing={6}>
                {((outboundRelationshipsWithLabels && outboundRelationshipsWithLabels.length > 0) || 
                  (inboundRelationshipsWithLabels && inboundRelationshipsWithLabels.length > 0)) && (
                  <div style={{ width: "100%" }}>
                    <Heading size="sm" mb={3}>Relationships</Heading>
                    <RelationshipsTable 
                      outboundRelationships={outboundRelationshipsWithLabels || []}
                      inboundRelationships={inboundRelationshipsWithLabels || []}
                    />
                  </div>
                )}

                {propertiesWithLabels && propertiesWithLabels.length > 0 && (
                  <div style={{ width: "100%" }}>
                    <Heading size="sm" mb={3}>Properties</Heading>
                    <NodePropertiesTable properties={propertiesWithLabels} />
                  </div>
                )}
              </VStack>
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
};

export default NodeDetailsDrawer;