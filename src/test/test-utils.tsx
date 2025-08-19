/**
 * Test utilities for wrapping components with required providers
 */

import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

// Custom render function that includes ChakraProvider
const customRender = (ui: React.ReactElement, options?: RenderOptions) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ChakraProvider value={defaultSystem}>
      {children}
    </ChakraProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything
export * from "@testing-library/react";

// Override render method
export { customRender as render };