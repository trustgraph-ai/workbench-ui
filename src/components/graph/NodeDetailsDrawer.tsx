import React from "react";
import { Drawer, Text, VStack, Heading, List } from "@chakra-ui/react";
import { X } from "lucide-react";

import { useNodeDetails } from "../../state/node-details";
import { useSessionStore } from "../../state/session";

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
  const { outboundRelationships, inboundRelationships, triplesLoading } = useNodeDetails(node?.id, flowId);
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
            <Drawer.Title>Node Details</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            {node && (
              <VStack align="start" spacing={6}>
                <div>
                  <Text fontWeight="bold">Node ID:</Text>
                  <Text>{node.id}</Text>
                </div>
                <div>
                  <Text fontWeight="bold">Node Label:</Text>
                  <Text>{node.label}</Text>
                </div>
                
                {outboundRelationships && outboundRelationships.length > 0 && (
                  <div style={{ width: "100%" }}>
                    <Heading size="sm" mb={3}>Outgoing Relationships</Heading>
                    <List.Root>
                      {outboundRelationships.map((relationship, index) => (
                        <List.Item key={index}>
                          {relationship}
                        </List.Item>
                      ))}
                    </List.Root>
                  </div>
                )}

                {inboundRelationships && inboundRelationships.length > 0 && (
                  <div style={{ width: "100%" }}>
                    <Heading size="sm" mb={3}>Incoming Relationships</Heading>
                    <List.Root>
                      {inboundRelationships.map((relationship, index) => (
                        <List.Item key={index}>
                          {relationship}
                        </List.Item>
                      ))}
                    </List.Root>
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