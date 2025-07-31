import React from "react";
import { Drawer, Text, VStack } from "@chakra-ui/react";
import { X } from "lucide-react";

interface NodeDetailsDrawerProps {
  node: {
    id: string;
    label: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const NodeDetailsDrawer: React.FC<NodeDetailsDrawerProps> = ({ node, isOpen, onClose }) => {
  console.log("Drawer rendering with node:", node);
  
  return (
    <Drawer.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} placement="end" size="sm" modal={false}>
      <Drawer.Positioner>
        <Drawer.Content>
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
              <VStack align="start" spacing={4}>
                <div>
                  <Text fontWeight="bold">Node ID:</Text>
                  <Text>{node.id}</Text>
                </div>
                <div>
                  <Text fontWeight="bold">Node Label:</Text>
                  <Text>{node.label}</Text>
                </div>
              </VStack>
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
};

export default NodeDetailsDrawer;