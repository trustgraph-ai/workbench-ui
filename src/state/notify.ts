import { toaster } from "../components/ui/toaster";

export const useNotification = () => {
  return {
    success: (title) => {
      toaster.create({
        title: title,
        type: "success",
      });
    },
    error: (error) => {
      toaster.create({
        title: "Error: " + error,
        type: "error",
      });
    },
    info: (info) => {
      toaster.create({
        title: info,
        type: "info",
      });
    },
  };
};
