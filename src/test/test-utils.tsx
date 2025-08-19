/**
 * Test utilities for wrapping components with required providers
 */

import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Custom render function that includes ChakraProvider and QueryClient
const customRender = (ui: React.ReactElement, options?: RenderOptions) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything
export * from "@testing-library/react";

// Override render method
export { customRender as render };
