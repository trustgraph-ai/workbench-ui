// React Query hooks for data fetching and mutation management
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

// TrustGraph socket connection for API communication
import { useSocket } from "../api/trustgraph/socket";
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
 * Provides async operations for loading, updating, and managing settings
 * Uses backend storage with localStorage as fallback/cache
 */
export const useSettings = () => {
  // Socket connection for API calls
  const socket = useSocket();
  // Query client for cache management
  const queryClient = useQueryClient();
  // Notification system for user feedback
  const notify = useNotification();

  // Query to fetch settings from backend
  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      try {
        const res = await socket
          .config()
          .getConfig([{ type: "settings", key: "user" }]);

        if (res["error"]) {
          console.log(
            "Settings backend error, falling back to localStorage:",
            res,
          );
          // Fall back to localStorage if backend fails
          return loadFromLocalStorage();
        }

        const settings = JSON.parse(res.values[0].value);
        const mergedSettings = mergeWithDefaults(settings);

        // Update localStorage cache
        updateLocalStorage(mergedSettings);

        return mergedSettings;
      } catch (error) {
        console.log(
          "Settings fetch failed, falling back to localStorage:",
          error,
        );
        // Fall back to localStorage if anything goes wrong
        return loadFromLocalStorage();
      }
    },
    // Enable background refetching
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Mutation for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: async ({
      settings,
      onSuccess,
    }: {
      settings: Settings;
      onSuccess?: () => void;
    }) => {
      try {
        const res = await socket.config().putConfig([
          {
            type: "settings",
            key: "user",
            value: JSON.stringify(settings),
          },
        ]);

        if (res["error"]) {
          console.log("Error:", res);
          throw new Error(res.error.message);
        }

        // Update localStorage cache
        updateLocalStorage(settings);

        // Execute callback if provided
        if (onSuccess) onSuccess();
      } catch (error) {
        // On error, still update localStorage as fallback
        updateLocalStorage(settings);
        throw error;
      }
    },
    onError: (err) => {
      console.log("Settings update error:", err);
      notify.error(`Failed to save settings: ${err.toString()}`);
    },
    onSuccess: () => {
      // Refresh the settings data after successful update
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      notify.success("Settings updated");
    },
  });

  // Mutation for resetting settings to defaults
  const resetSettingsMutation = useMutation({
    mutationFn: async ({ onSuccess }: { onSuccess?: () => void } = {}) => {
      try {
        // Delete from backend
        await socket.config().deleteConfig([
          {
            type: "settings",
            key: "user",
          },
        ]);

        // Clear localStorage
        localStorage.removeItem(SETTINGS_STORAGE_KEY);

        // Execute callback if provided
        if (onSuccess) onSuccess();
      } catch (error) {
        // On error, still clear localStorage
        localStorage.removeItem(SETTINGS_STORAGE_KEY);
        throw error;
      }
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
    const newSettings = { ...settings };
    const keys = path.split(".");

    if (keys.length === 2) {
      const [section, key] = keys;
      if (section in newSettings) {
        (newSettings as Record<string, Record<string, unknown>>)[section] = {
          ...(newSettings as Record<string, Record<string, unknown>>)[
            section
          ],
          [key]: value,
        };

        updateSettingsMutation.mutate({ settings: newSettings });
      }
    }
  };

  // Helper function to save complete settings
  const saveSettings = (newSettings: Settings) => {
    updateSettingsMutation.mutate({ settings: newSettings });
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
      updateSettingsMutation.mutate({ settings: validatedSettings });
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
