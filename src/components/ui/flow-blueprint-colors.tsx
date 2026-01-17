import { useColorModeValue } from "../ui/color-mode";

import { system } from "../../theme";

// Node colors - Blueprint nodes (blue)
export const useBlueprintBorderColor = () =>
  useColorModeValue(
    system.token("colors.blue.600"),
    system.token("colors.blue.400"),
  );

export const useBlueprintBackgroundColor = () =>
  useColorModeValue(
    system.token("colors.blue.50"),
    system.token("colors.blue.900"),
  );

// Node colors - Flow nodes (green)
export const useFlowBorderColor = () =>
  useColorModeValue(
    system.token("colors.green.600"),
    system.token("colors.green.400"),
  );

export const useFlowBackgroundColor = () =>
  useColorModeValue(
    system.token("colors.green.50"),
    system.token("colors.green.900"),
  );

// Interface node colors - Service interfaces (purple)
export const useServiceInterfaceBorderColor = () =>
  useColorModeValue(
    system.token("colors.purple.600"),
    system.token("colors.purple.400"),
  );

export const useServiceInterfaceBackgroundColor = () =>
  useColorModeValue(
    system.token("colors.purple.50"),
    system.token("colors.purple.900"),
  );

// Interface node colors - Flow interfaces (pink)
export const useFlowInterfaceBorderColor = () =>
  useColorModeValue(
    system.token("colors.pink.600"),
    system.token("colors.pink.400"),
  );

export const useFlowInterfaceBackgroundColor = () =>
  useColorModeValue(
    system.token("colors.pink.50"),
    system.token("colors.pink.900"),
  );

// Connection handle colors
export const useProvideHandleColor = () =>
  useColorModeValue(
    system.token("colors.green.600"),
    system.token("colors.green.400"),
  );

export const useConsumeHandleColor = () =>
  useColorModeValue(
    system.token("colors.red.600"),
    system.token("colors.red.400"),
  );

// Text colors
export const useNodeTextColor = () =>
  useColorModeValue(
    system.token("colors.gray.900"),
    system.token("colors.gray.100"),
  );

export const useNodeLabelColor = () =>
  useColorModeValue(
    system.token("colors.gray.600"),
    system.token("colors.gray.400"),
  );

export const useDescriptionTextColor = () =>
  useColorModeValue(
    system.token("colors.gray.600"),
    system.token("colors.gray.400"),
  );

// Connection label styling
export const useConnectionLabelBackgroundColor = () =>
  useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(26, 32, 44, 0.9)");

export const useConnectionLabelBorderColor = () =>
  useColorModeValue(
    system.token("colors.gray.200"),
    system.token("colors.gray.700"),
  );

// Interface handle border
export const useInterfaceHandleBorderColor = () =>
  useColorModeValue(
    system.token("colors.white"),
    system.token("colors.gray.800"),
  );

// Shadow color
export const useNodeShadowColor = () =>
  useColorModeValue("rgba(0, 0, 0, 0.1)", "rgba(0, 0, 0, 0.3)");

// Header/UI colors
export const useHeaderBackgroundColor = () =>
  useColorModeValue(
    system.token("colors.white"),
    system.token("colors.gray.800"),
  );

export const useHeaderBorderColor = () =>
  useColorModeValue(
    system.token("colors.gray.200"),
    system.token("colors.gray.700"),
  );

// MiniMap colors
export const useMiniMapBackgroundColor = () =>
  useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(26, 32, 44, 0.8)");

// Edge label colors
export const useEdgeLabelBackgroundColor = () =>
  useColorModeValue(
    system.token("colors.white"),
    system.token("colors.gray.800"),
  );

export const useEdgeLabelTextColor = () =>
  useColorModeValue(
    system.token("colors.gray.900"),
    system.token("colors.gray.100"),
  );
