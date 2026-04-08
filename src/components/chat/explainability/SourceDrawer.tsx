import { useState, useEffect } from "react";
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
import { useSocket } from "@trustgraph/react-provider";
import type { ProvenanceChainItem } from "@trustgraph/react-state";

interface SourceDrawerProps {
  source: ProvenanceChainItem | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Fetch chunk text from the librarian via streamDocument.
 * Content arrives base64-encoded; we decode it to UTF-8.
 */
const useChunkText = (chunkUri: string | undefined, enabled: boolean) => {
  const socket = useSocket();
  const [text, setText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !chunkUri) {
      setText(null);
      return;
    }

    setIsLoading(true);
    setText(null);

    let accumulated = "";

    try {
      socket.librarian().streamDocument(
        chunkUri,
        (content, _chunkIndex, _totalChunks, complete) => {
          accumulated += content;
          if (complete) {
            try {
              setText(atob(accumulated));
            } catch {
              setText(accumulated);
            }
            setIsLoading(false);
          }
        },
        (_error) => {
          setIsLoading(false);
        }
      );
    } catch {
      setIsLoading(false);
    }
  }, [socket, chunkUri, enabled]);

  return { text, isLoading };
};

const SourceDrawer = ({ source, isOpen, onClose }: SourceDrawerProps) => {
  const { metadata, isLoading: metadataLoading } = useDocumentMetadata({
    documentId: source?.uri,
    enabled: isOpen && !!source?.uri,
  });

  // Fetch chunk text for the source (first item in chain is typically the chunk)
  const { text: chunkText, isLoading: textLoading } = useChunkText(
    source?.uri,
    isOpen && !!source?.uri
  );

  const isLoading = metadataLoading || textLoading;

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
            {isLoading && !metadata && !chunkText ? (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" />
                <Text mt={2} color="fg.muted">
                  Loading source details...
                </Text>
              </Box>
            ) : (
              <VStack align="stretch" gap={4}>
                {source?.label && (
                  <Box>
                    <Text fontSize="sm" color="fg.muted">
                      {source.label}
                    </Text>
                  </Box>
                )}

                {metadata && (
                  <>
                    <Box>
                      <Heading size="sm" mb={1}>
                        {metadata.name || "Untitled Document"}
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
                  </>
                )}

                {chunkText && (
                  <Box>
                    <Text fontSize="xs" fontWeight="medium" color="fg.muted" mb={1}>
                      Source Text
                    </Text>
                    <Box
                      bg="bg.subtle"
                      borderRadius="md"
                      p={3}
                      maxH="400px"
                      overflowY="auto"
                    >
                      <Text fontSize="sm" whiteSpace="pre-wrap">
                        {chunkText}
                      </Text>
                    </Box>
                  </Box>
                )}

                {!metadata && !chunkText && (
                  <Box textAlign="center" py={8}>
                    <Text color="fg.muted">
                      {source ? "No additional details available" : "No source selected"}
                    </Text>
                  </Box>
                )}

              </VStack>
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
};

export default SourceDrawer;
