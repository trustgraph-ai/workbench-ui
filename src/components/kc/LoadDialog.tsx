import React, { useState, useRef } from "react";

import { Play } from "lucide-react";

import { Portal, Button, Dialog, Box, CloseButton } from "@chakra-ui/react";

import { useFlows } from "../../state/flows";
import SelectField from "../common/SelectField";
import SelectOption from "../common/SelectOption";

const LoadDialog = ({ open, onOpenChange, selectedIds, onLoad }) => {
  const flowState = useFlows();

  const flowClasses = flowState.flowClasses ? flowState.flowClasses : [];

  const [flowClass, setFlowClass] = useState(undefined);

  const onSubmit = () => {
    if (!flowClass) return;
    
    onLoad(selectedIds, flowClass);
    onOpenChange(false);
  };

  const flowClassOptions = flowClasses.map((flowClass) => {
    return {
      value: flowClass[0],
      label: flowClass[1].description,
      description: (
        <SelectOption title={flowClass[1].description}>
          {flowClass[0]}
        </SelectOption>
      ),
    };
  });

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog.Root
      placement="center"
      open={open}
      onOpenChange={(x) => {
        onOpenChange(x.open);
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content ref={contentRef}>
            <Dialog.Header>
              <Dialog.Title>Load Knowledge Cores</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Box>Load {selectedIds.length} knowledge core(s) with the following flow:</Box>

              <Box mt={5}>
                <SelectField
                  label="Processing flow"
                  items={flowClassOptions}
                  value={flowClass}
                  onValueChange={(x) => {
                    setFlowClass(x);
                  }}
                  contentRef={contentRef}
                />
              </Box>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => onSubmit()}
                colorPalette="brand"
                disabled={!flowClass}
              >
                <Play /> Load
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default LoadDialog;