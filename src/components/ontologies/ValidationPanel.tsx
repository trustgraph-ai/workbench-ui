import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Separator,
  Alert,
} from "@chakra-ui/react";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Hash,
  Link,
  Type,
} from "lucide-react";
import { ValidationResult, ValidationIssue } from "./OntologyValidator";
import {
  usePanelBackgroundColor,
  useContentBackgroundColor,
  useSubtleTextColor,
  useHoverBackgroundColor,
  useSuccessBackgroundColor,
  useSuccessTextColor,
  useErrorBackgroundColor,
  useErrorTextColor,
  useWarningTextColor,
  useInfoTextColor,
} from "../ui/ontology-colors";

interface ValidationPanelProps {
  validationResult: ValidationResult;
  onNavigateToItem?: (
    itemId: string,
    itemType: "class" | "objectProperty" | "datatypeProperty",
  ) => void;
  onClose: () => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  validationResult,
  onNavigateToItem,
  onClose,
}) => {
  const panelBg = usePanelBackgroundColor();
  const contentBg = useContentBackgroundColor();
  const subtleText = useSubtleTextColor();
  const hoverBg = useHoverBackgroundColor();
  const successBg = useSuccessBackgroundColor();
  const successText = useSuccessTextColor();
  const errorBg = useErrorBackgroundColor();
  const errorText = useErrorTextColor();
  const warningText = useWarningTextColor();
  const infoText = useInfoTextColor();

  const { isValid, issues, summary } = validationResult;

  const getIssueIcon = (type: ValidationIssue["type"]) => {
    switch (type) {
      case "error":
        return <XCircle size={14} color={errorText} />;
      case "warning":
        return <AlertTriangle size={14} color={warningText} />;
      case "info":
        return <Info size={14} color={infoText} />;
    }
  };

  const getIssueTextColor = (type: ValidationIssue["type"]) => {
    switch (type) {
      case "error":
        return errorText;
      case "warning":
        return warningText;
      case "info":
        return infoText;
    }
  };

  const getIssueColor = (type: ValidationIssue["type"]) => {
    switch (type) {
      case "error":
        return "red";
      case "warning":
        return "orange";
      case "info":
        return "blue";
    }
  };

  const getItemIcon = (itemType?: ValidationIssue["itemType"]) => {
    switch (itemType) {
      case "class":
        return <Hash size={12} color={subtleText} />;
      case "objectProperty":
        return <Link size={12} color={subtleText} />;
      case "datatypeProperty":
        return <Type size={12} color={subtleText} />;
      default:
        return null;
    }
  };

  const handleNavigateToItem = (issue: ValidationIssue) => {
    if (issue.itemId && issue.itemType && onNavigateToItem) {
      onNavigateToItem(issue.itemId, issue.itemType);
    }
  };

  if (issues.length === 0) {
    return (
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="md"
        bg={successBg}
        borderColor="green.200"
      >
        <HStack spacing={3}>
          <CheckCircle size={20} color={successText} />
          <VStack align="start" spacing={1}>
            <Text fontWeight="semibold" color={successText}>
              Ontology is valid
            </Text>
            <Text fontSize="sm" color={successText}>
              No validation issues found. Your ontology follows best practices.
            </Text>
          </VStack>
        </HStack>
      </Box>
    );
  }

  return (
    <Box borderWidth="1px" borderRadius="md" bg={panelBg} overflow="hidden">
      {/* Header */}
      <Box p={4} bg={contentBg} borderBottomWidth="1px">
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontWeight="semibold" fontSize="lg">
              Validation Results
            </Text>
            <HStack spacing={4}>
              {summary.errors > 0 && (
                <HStack spacing={1}>
                  <XCircle size={14} color={errorText} />
                  <Text fontSize="sm" color={errorText}>
                    {summary.errors} error{summary.errors !== 1 ? "s" : ""}
                  </Text>
                </HStack>
              )}
              {summary.warnings > 0 && (
                <HStack spacing={1}>
                  <AlertTriangle size={14} color={warningText} />
                  <Text fontSize="sm" color={warningText}>
                    {summary.warnings} warning
                    {summary.warnings !== 1 ? "s" : ""}
                  </Text>
                </HStack>
              )}
              {summary.info > 0 && (
                <HStack spacing={1}>
                  <Info size={14} color={infoText} />
                  <Text fontSize="sm" color={infoText}>
                    {summary.info} suggestion{summary.info !== 1 ? "s" : ""}
                  </Text>
                </HStack>
              )}
            </HStack>
          </VStack>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </HStack>
      </Box>

      {/* Issues List */}
      <Box maxH="400px" overflow="auto">
        <VStack align="stretch" spacing={0}>
          {issues.map((issue, index) => (
            <Box key={index}>
              <Box
                p={4}
                _hover={{ bg: hoverBg }}
                cursor={
                  issue.itemId && onNavigateToItem ? "pointer" : "default"
                }
                onClick={() => handleNavigateToItem(issue)}
              >
                <VStack align="stretch" spacing={2}>
                  <HStack spacing={3} align="start">
                    {getIssueIcon(issue.type)}
                    <VStack align="start" spacing={1} flex="1">
                      <HStack spacing={2} align="center">
                        <Text
                          fontWeight="medium"
                          color={getIssueTextColor(issue.type)}
                        >
                          {issue.message}
                        </Text>
                        {issue.itemId && issue.itemType && (
                          <HStack spacing={1}>
                            {getItemIcon(issue.itemType)}
                            <Badge
                              size="sm"
                              colorPalette={getIssueColor(issue.type)}
                              variant="subtle"
                            >
                              {issue.itemId}
                            </Badge>
                          </HStack>
                        )}
                      </HStack>
                      {issue.suggestion && (
                        <Text fontSize="sm" color={subtleText}>
                          💡 {issue.suggestion}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                </VStack>
              </Box>
              {index < issues.length - 1 && <Separator />}
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Footer with overall status */}
      {!isValid && (
        <Box p={3} bg={errorBg} borderTopWidth="1px">
          <Alert.Root status="error" size="sm">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                This ontology has validation issues that should be addressed
                before export or publication.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        </Box>
      )}
    </Box>
  );
};
