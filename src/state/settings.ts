import { create } from "zustand";
import {
  Settings,
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
} from "../model/settings-types";

interface SettingsState {
  settings: Settings;
  isLoaded: boolean;

  // Actions
  updateSetting: (path: string, value: unknown) => void;
  saveSettings: (newSettings: Settings) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (jsonString: string) => void;
  loadSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  loadSettings: () => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        const mergedSettings = {
          authentication: {
            ...DEFAULT_SETTINGS.authentication,
            ...parsed.authentication,
          },
          graphrag: { ...DEFAULT_SETTINGS.graphrag, ...parsed.graphrag },
          featureSwitches: {
            ...DEFAULT_SETTINGS.featureSwitches,
            ...parsed.featureSwitches,
          },
        };
        set({ settings: mergedSettings, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      console.warn("Failed to load settings from localStorage:", error);
      set({ isLoaded: true });
    }
  },

  updateSetting: (path: string, value: unknown) => {
    const { settings } = get();
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
      }
    }

    // Update state and localStorage
    set({ settings: newSettings });
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  },

  saveSettings: (newSettings: Settings) => {
    set({ settings: newSettings });
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
      throw error;
    }
  },

  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS });
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to reset settings:", error);
      throw error;
    }
  },

  exportSettings: () => {
    const { settings } = get();
    return JSON.stringify(settings, null, 2);
  },

  importSettings: (jsonString: string) => {
    try {
      const imported = JSON.parse(jsonString);
      // Validate structure by merging with defaults
      const validatedSettings = {
        authentication: {
          ...DEFAULT_SETTINGS.authentication,
          ...imported.authentication,
        },
        graphrag: { ...DEFAULT_SETTINGS.graphrag, ...imported.graphrag },
        featureSwitches: {
          ...DEFAULT_SETTINGS.featureSwitches,
          ...imported.featureSwitches,
        },
      };
      get().saveSettings(validatedSettings);
    } catch (error) {
      console.error("Failed to import settings:", error);
      throw error;
    }
  },
}));

// Hook for convenience
export const useSettings = () => {
  const store = useSettingsStore();

  // Load settings on first use
  if (!store.isLoaded) {
    store.loadSettings();
  }

  return store;
};
