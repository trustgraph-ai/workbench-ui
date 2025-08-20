// React Query hooks for data fetching and mutation management
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

// Notification system for user feedback
import { useNotification } from "./notify";
// Activity tracking for loading states
import { useActivity } from "./activity";
// Settings types and defaults
import {
  Settings,
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
} from "../model/settings-types";

/**
 * Utility function to merge imported settings with defaults
 * Ensures all required properties exist and handles partial imports
 */
const mergeWithDefaults = (settings: Partial<Settings>): Settings => {
  return {
    authentication: {
      ...DEFAULT_SETTINGS.authentication,
      ...settings.authentication,
    },
    graphrag: {
      ...DEFAULT_SETTINGS.graphrag,
      ...settings.graphrag,
    },
    featureSwitches: {
      ...DEFAULT_SETTINGS.featureSwitches,
      ...settings.featureSwitches,
    },
  };
};

/**
 * Utility function to update localStorage as a cache/fallback
 */
const updateLocalStorage = (settings: Settings) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("Failed to update localStorage:", error);
  }
};

/**
 * Utility function to load from localStorage as fallback
 */
const loadFromLocalStorage = (): Settings => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return mergeWithDefaults(parsed);
    }
  } catch (error) {
    console.warn("Failed to load from localStorage:", error);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Custom hook for managing application settings
 * Uses TanStack Query for consistent async patterns while storing in localStorage
 * Ready for future backend integration when needed
 */
export const useSettings = () => {
  // Query client for cache management
  const queryClient = useQueryClient();
  // Notification system for user feedback
  const notify = useNotification();

  // Query to fetch settings from localStorage
  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      // Minimal delay for async consistency
      await new Promise((resolve) => setTimeout(resolve, 1));
      const settings = loadFromLocalStorage();
      console.log("Settings loaded from localStorage");
      return settings;
    },
    // Enable background refetching
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Mutation for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: async ({
      path,
      value,
      onSuccess,
    }: {
      path: string;
      value: unknown;
      onSuccess?: () => void;
    }) => {
      // Minimal delay for async consistency
      await new Promise((resolve) => setTimeout(resolve, 1));

      // Get fresh settings from localStorage to avoid race conditions
      const currentSettings = loadFromLocalStorage();
      const newSettings = { ...currentSettings };
      const keys = path.split(".");

      if (keys.length === 2) {
        const [section, key] = keys;
        if (section in newSettings) {
          (newSettings as Record<string, Record<string, unknown>>)[section] =
            {
              ...(newSettings as Record<string, Record<string, unknown>>)[
                section
              ],
              [key]: value,
            };
        }
      }

      // Update localStorage
      updateLocalStorage(newSettings);

      // Execute callback if provided
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.log("Settings update error:", err);
      notify.error(`Failed to save settings: ${err.toString()}`);
    },
    onSuccess: () => {
      // Refresh the settings data after successful update
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  // Mutation for resetting settings to defaults
  const resetSettingsMutation = useMutation({
    mutationFn: async ({ onSuccess }: { onSuccess?: () => void } = {}) => {
      // Minimal delay for async consistency
      await new Promise((resolve) => setTimeout(resolve, 1));

      // Clear localStorage
      localStorage.removeItem(SETTINGS_STORAGE_KEY);

      // Execute callback if provided
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.log("Settings reset error:", err);
      notify.error(`Failed to reset settings: ${err.toString()}`);
    },
    onSuccess: () => {
      // Refresh the settings data after successful reset
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      notify.success("Settings reset to defaults");
    },
  });

  // Track loading states for UI feedback
  useActivity(settingsQuery.isLoading, "Loading settings");
  useActivity(updateSettingsMutation.isPending, "Saving settings");
  useActivity(resetSettingsMutation.isPending, "Resetting settings");

  // Get current settings or defaults
  const settings = settingsQuery.data || DEFAULT_SETTINGS;

  // Helper function to update a specific setting path
  const updateSetting = (path: string, value: unknown) => {
    updateSettingsMutation.mutate({ path, value });
  };

  // Helper function to save complete settings
  const saveSettings = (newSettings: Settings) => {
    // For complete settings replacement, directly update localStorage
    updateLocalStorage(newSettings);
    // Then invalidate the query to refetch
    queryClient.invalidateQueries({ queryKey: ["settings"] });
  };

  // Helper function to reset settings
  const resetSettings = () => {
    resetSettingsMutation.mutate();
  };

  // Helper function to export settings as JSON
  const exportSettings = (): string => {
    return JSON.stringify(settings, null, 2);
  };

  // Helper function to import settings from JSON
  const importSettings = (jsonString: string) => {
    try {
      const imported = JSON.parse(jsonString);
      const validatedSettings = mergeWithDefaults(imported);
      saveSettings(validatedSettings);
    } catch (error) {
      notify.error("Failed to import settings: Invalid JSON format");
      throw error;
    }
  };

  // Return the public API for the hook
  return {
    // Settings data and state
    settings,
    isLoaded: !settingsQuery.isLoading,
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error,

    // Settings operations
    updateSetting,
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings,

    // Loading states for individual operations
    isSaving: updateSettingsMutation.isPending,
    isResetting: resetSettingsMutation.isPending,

    // Manual refetch function
    refetch: settingsQuery.refetch,
  };
};
