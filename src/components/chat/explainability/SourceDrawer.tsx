import {
  Drawer,
  Box,
  Text,
  Heading,
  VStack,
  Spinner,
  CloseButton,
} from "@chakra-ui/react";
import { FileText } from "lucide-react";
import { useDocumentMetadata } from "@trustgraph/react-state";
import type { ProvenanceChainItem } from "@trustgraph/react-state";

interface SourceDrawerProps {
  source: ProvenanceChainItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const SourceDrawer = ({ source, isOpen, onClose }: SourceDrawerProps) => {
  const { metadata, isLoading } = useDocumentMetadata({
    documentId: source?.uri,
    enabled: isOpen && !!source?.uri,
  });

  return (
    <Drawer.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} placement="end" size="md">
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.Header borderBottomWidth="1px">
            <Drawer.Title display="flex" alignItems="center" gap={2}>
              <FileText size={20} />
              Source Document
            </Drawer.Title>
            <Drawer.CloseTrigger asChild position="absolute" top={3} right={3}>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Header>

          <Drawer.Body>
            {isLoading ? (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" />
                <Text mt={2} color="fg.muted">
                  Loading document details...
                </Text>
              </Box>
            ) : metadata ? (
              <VStack align="stretch" gap={4}>
                <Box>
                  <Heading size="sm" mb={1}>
                    {metadata.name || source?.label || "Untitled Document"}
                  </Heading>
                  {metadata.description && (
                    <Text fontSize="sm" color="fg.muted">
                      {metadata.description}
                    </Text>
                  )}
                </Box>

                {metadata.author && (
                  <Box>
                    <Text fontSize="xs" fontWeight="medium" color="fg.muted">
                      Author
                    </Text>
                    <Text fontSize="sm">{metadata.author}</Text>
                  </Box>
                )}

                {metadata.keywords && metadata.keywords.length > 0 && (
                  <Box>
                    <Text fontSize="xs" fontWeight="medium" color="fg.muted">
                      Keywords
                    </Text>
                    <Text fontSize="sm">{metadata.keywords.join(", ")}</Text>
                  </Box>
                )}

                <Box>
                  <Text fontSize="xs" fontWeight="medium" color="fg.muted">
                    Document URI
                  </Text>
                  <Text fontSize="xs" fontFamily="mono" wordBreak="break-all">
                    {source?.uri}
                  </Text>
                </Box>
              </VStack>
            ) : (
              <Box textAlign="center" py={8}>
                <Text color="fg.muted">
                  {source ? "No additional details available" : "No source selected"}
                </Text>
              </Box>
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
};

export default SourceDrawer;
