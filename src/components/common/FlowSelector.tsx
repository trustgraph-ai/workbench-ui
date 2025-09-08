import { useState, useEffect } from "react";

import {
  Text,
  Box,
  Stack,
  HStack,
  Button,
  Input,
  Popover,
  Portal,
} from "@chakra-ui/react";

import { Database, Workflow, Save, X } from "lucide-react";

import { useSessionStore } from "../../state/session";
import { useFlows } from "../../state/flows";
import { useSettings } from "../../state/settings";

const FlowSelector = () => {
  const flowState = useFlows();
  const flows = flowState.flows ? flowState.flows : [];

  const flowId = useSessionStore((state) => state.flowId);

  const setFlowId = useSessionStore((state) => state.setFlowId);
  const setFlow = useSessionStore((state) => state.setFlow);

  const { settings, updateSetting } = useSettings();

  const [open, setOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(false);
  const [collectionValue, setCollectionValue] = useState(settings.collection);

  // Keep staged value in sync with saved value
  useEffect(() => {
    setCollectionValue(settings.collection);
  }, [settings.collection]);

  const handleCollectionSave = () => {
    const trimmedValue = collectionValue.trim();
    if (trimmedValue) {
      updateSetting("collection", trimmedValue);
      setEditingCollection(false);
    }
  };

  const handleCollectionCancel = () => {
    setCollectionValue(settings.collection);
    setEditingCollection(false);
  };

  const handleCollectionEdit = () => {
    setCollectionValue(settings.collection);
    setEditingCollection(true);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      size="xl"
      positioning={{ placement: "bottom-end" }}
    >
      <Popover.Trigger asChild>
        <Stack
          p={3}
          gap={2}
          borderWidth="1px"
          borderRadius="8px"
          borderColor="border.inverted/20"
          color="fg.muted"
          backgroundColor="primary.bg"
          _hover={{
            backgroundColor: "bg.emphasized",
            borderColor: "border.inverted",
            color: "fg",
          }}
          onClick={() => setOpen(true)}
          cursor="pointer"
        >
          <HStack gap={2} align="center">
            <Database size={14} />
            <Text fontSize="xs" fontWeight="medium">
              {settings.collection}
            </Text>
          </HStack>

          <HStack gap={2} align="center">
            <Workflow size={14} />
            <Text fontSize="xs" fontWeight="medium">
              {flowId || "<none>"}
            </Text>
          </HStack>
        </Stack>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Body>
              <Stack gap={4} p={4}>
                {/* Current Information Display */}
                <Stack gap={3}>
                  <Text fontWeight="semibold" fontSize="sm" color="fg.muted">
                    Current Settings
                  </Text>

                  <HStack gap={3} align="center">
                    <Database size={16} color="currentColor" />
                    <Box flex="1">
                      <Text fontSize="sm" fontWeight="medium">
                        Collection
                      </Text>
                      {editingCollection ? (
                        <HStack gap={2} mt={1}>
                          <Input
                            size="xs"
                            value={collectionValue}
                            onChange={(e) =>
                              setCollectionValue(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleCollectionSave();
                              if (e.key === "Escape")
                                handleCollectionCancel();
                            }}
                            placeholder="Enter collection name"
                            autoFocus
                          />
                          <Button
                            size="xs"
                            colorPalette="primary"
                            onClick={handleCollectionSave}
                            disabled={!collectionValue.trim()}
                          >
                            <Save size={12} />
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={handleCollectionCancel}
                          >
                            <X size={12} />
                          </Button>
                        </HStack>
                      ) : (
                        <HStack gap={2} mt={1}>
                          <Text fontSize="xs" color="fg.muted" flex="1">
                            {settings.collection}
                          </Text>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={handleCollectionEdit}
                          >
                            Edit
                          </Button>
                        </HStack>
                      )}
                    </Box>
                  </HStack>
                </Stack>

                {/* Flow Selection */}
                <Box borderTopWidth="1px" borderColor="border.subtle" pt={4}>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="fg.muted"
                    mb={3}
                  >
                    Select Flow
                  </Text>
                  <Stack gap="1">
                    {flows.map((flow) => {
                      const isSelected = flowId === flow.id;
                      return (
                        <Box
                          key={flow.id}
                          p={3}
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor={
                            isSelected ? "primary.500" : "border.subtle"
                          }
                          backgroundColor={
                            isSelected ? "primary.50" : "transparent"
                          }
                          _hover={{
                            borderColor: "primary.300",
                            backgroundColor: isSelected
                              ? "primary.100"
                              : "bg.subtle",
                          }}
                          cursor="pointer"
                          onClick={() => {
                            setFlowId(flow.id);
                            setFlow(flow);
                          }}
                        >
                          <HStack gap={3} align="start">
                            <Box
                              w={4}
                              h={4}
                              borderRadius="full"
                              borderWidth="2px"
                              borderColor={
                                isSelected
                                  ? "colorPalette.500"
                                  : "border.emphasized"
                              }
                              backgroundColor={
                                isSelected
                                  ? "colorPalette.500"
                                  : "transparent"
                              }
                              mt={0.5}
                              flexShrink={0}
                              position="relative"
                            >
                              {isSelected && (
                                <Box
                                  w="6px"
                                  h="6px"
                                  borderRadius="full"
                                  backgroundColor="bg"
                                  position="absolute"
                                  top="50%"
                                  left="50%"
                                  transform="translate(-50%, -50%)"
                                />
                              )}
                            </Box>
                            <Box flex="1">
                              <Text
                                fontWeight="semibold"
                                fontSize="sm"
                                mb={1}
                              >
                                {flow.id}
                              </Text>
                              <Text
                                fontSize="xs"
                                color="fg.muted"
                                lineHeight="1.4"
                              >
                                {flow.description}
                              </Text>
                            </Box>
                          </HStack>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              </Stack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export default FlowSelector;
