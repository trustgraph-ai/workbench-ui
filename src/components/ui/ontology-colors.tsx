import { useColorModeValue } from "../ui/color-mode";

import { system } from "../../theme";

// Panel and content area backgrounds
export const usePanelBackgroundColor = () =>
  useColorModeValue(
    system.token("colors.white"),
    system.token("colors.gray.800"),
  );

export const useContentBackgroundColor = () =>
  useColorModeValue(
    system.token("colors.gray.50"),
    system.token("colors.gray.900"),
  );

// Header backgrounds
export const useHeaderBackgroundColor = () =>
  useColorModeValue(
    system.token("colors.white"),
    system.token("colors.gray.800"),
  );

// Border colors
export const useBorderColor = () =>
  useColorModeValue(
    system.token("colors.gray.200"),
    system.token("colors.gray.700"),
  );

// Text colors
export const useTextColor = () =>
  useColorModeValue(
    system.token("colors.gray.900"),
    system.token("colors.gray.100"),
  );

export const useSubtleTextColor = () =>
  useColorModeValue(
    system.token("colors.gray.600"),
    system.token("colors.gray.400"),
  );
