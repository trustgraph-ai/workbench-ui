import React, { useState, useRef, useEffect } from "react";

import { Plus } from "lucide-react";

import { Portal, Button, Dialog, Box, CloseButton } from "@chakra-ui/react";

import { useFlows } from "../../state/flows";
import { useFlowParameters, useParameterValidation } from "../../state/flow-parameters";
import SelectField from "../common/SelectField";
import SelectOption from "../common/SelectOption";
import TextField from "../common/TextField";
import ParameterInputs from "./ParameterInputs";

const CreateDialog = ({ open, onOpenChange }) => {
  const flowState = useFlows();

  const flowClasses = flowState.flowClasses ? flowState.flowClasses : [];

  const [flowClass, setFlowClass] = useState(undefined);
  const [id, setId] = useState("");
  const [description, setDescription] = useState("");
  const [parameterValues, setParameterValues] = useState({});

  // Fetch parameter definitions when flow class is selected
  const {
    parameterDefinitions,
    parameterMapping,
    parameterMetadata,
    isLoading: isLoadingParameters
  } = useFlowParameters(flowClass);

  // Apply default values when parameter definitions change
  useEffect(() => {
    if (parameterMapping && parameterDefinitions && Object.keys(parameterMapping).length > 0) {
      const defaultValues = {};
      Object.entries(parameterMapping).forEach(([flowParamName, definitionName]) => {
        const schema = parameterDefinitions[definitionName];
        if (schema && schema.default !== undefined && parameterValues[flowParamName] === undefined) {
          defaultValues[flowParamName] = schema.default;
        }
      });

      if (Object.keys(defaultValues).length > 0) {
        setParameterValues(prev => ({ ...prev, ...defaultValues }));
      }
    }
  }, [parameterDefinitions, parameterMapping]);

  // Validate form including parameters
  const { isValid: areParametersValid, errors: parameterErrors } = useParameterValidation(
    parameterDefinitions,
    parameterMapping,
    parameterValues
  );

  const onSubmit = () => {
    // Validate required fields before submission
    if (!flowClass || !id.trim() || !description.trim() || !areParametersValid) {
      return;
    }

    flowState.startFlow({
      id: id,
      flowClass: flowClass,
      description: description,
      parameters: parameterValues,
      onSuccess: () => {
        // Clear form after successful submission
        setFlowClass(undefined);
        setId("");
        setDescription("");
        setParameterValues({});
        onOpenChange(false);
      },
    });
  };

  // Check if form is valid for submission
  const isFormValid = flowClass &&
    id.trim().length > 0 &&
    description.trim().length > 0 &&
    areParametersValid;

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
              <Dialog.Title>Create Flow</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Box mt={5}>Select flow class and configuration:</Box>

              <Box mt={5}>
                <SelectField
                  label="Flow class"
                  items={flowClassOptions}
                  value={flowClass ? [flowClass] : []}
                  onValueChange={(x) => {
                    // SelectField returns an array, extract the first element
                    setFlowClass(Array.isArray(x) ? x[0] : x);
                  }}
                  contentRef={contentRef}
                />
              </Box>

              <TextField
                label="ID"
                helperText="A unique ID for your flow"
                value={id}
                onValueChange={setId}
                required={true}
              />

              <TextField
                label="Description"
                helperText="A human-readable description"
                value={description}
                onValueChange={setDescription}
                required={true}
              />

              {/* Parameter inputs - only show if flow class has parameters */}
              {flowClass && (
                <ParameterInputs
                  parameterDefinitions={parameterDefinitions}
                  parameterMapping={parameterMapping}
                  parameterMetadata={parameterMetadata}
                  parameterValues={parameterValues}
                  onParameterChange={setParameterValues}
                  validationErrors={parameterErrors}
                  contentRef={contentRef}
                />
              )}
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => onSubmit()}
                colorPalette="primary"
                disabled={!isFormValid}
              >
                <Plus /> Create
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

export default CreateDialog;
