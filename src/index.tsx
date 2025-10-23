import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { system } from "./theme";
import { SocketProvider } from "./api/trustgraph/SocketProvider";
import { SettingsLoadingBoundary } from "./providers/SettingsLoadingBoundary";
import {
  NotificationProvider,
  NotificationHandler,
} from "@trustgraph/react-state";
import { toaster } from "./components/ui/toaster";

const queryClient = new QueryClient();

// Notification handler implementation using Chakra UI toaster
const notificationHandler: NotificationHandler = {
  success: (title: string) => {
    toaster.create({
      title: title,
      type: "success",
    });
  },
  error: (error: string) => {
    toaster.create({
      title: "Error: " + error,
      type: "error",
    });
  },
  warning: (warning: string) => {
    toaster.create({
      title: "Warning: " + warning,
      type: "warning",
    });
  },
  info: (info: string) => {
    toaster.create({
      title: info,
      type: "info",
    });
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationProvider handler={notificationHandler}>
        <ChakraProvider value={system}>
          <ThemeProvider attribute="class" disableTransitionOnChange>
            <SettingsLoadingBoundary>
              <SocketProvider>
                <App />
              </SocketProvider>
            </SettingsLoadingBoundary>
          </ThemeProvider>
        </ChakraProvider>
      </NotificationProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
