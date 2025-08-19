import { useState, useCallback, useEffect } from 'react';
import { Settings, DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '../model/settings-types';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        const mergedSettings = {
          authentication: { ...DEFAULT_SETTINGS.authentication, ...parsed.authentication },
          graphrag: { ...DEFAULT_SETTINGS.graphrag, ...parsed.graphrag },
          featureSwitches: { ...DEFAULT_SETTINGS.featureSwitches, ...parsed.featureSwitches },
        };
        setSettings(mergedSettings);
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage with functional update
  const saveSettings = useCallback((newSettings: Settings) => {
    setSettings(() => {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
        return newSettings;
      } catch (error) {
        console.error('Failed to save settings to localStorage:', error);
        throw error;
      }
    });
  }, []);

  // Update a specific setting using functional updates to prevent stale closure issues
  const updateSetting = useCallback((path: string, value: any) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings };
      const keys = path.split('.');
      
      if (keys.length === 2) {
        const [section, key] = keys;
        if (section in newSettings) {
          (newSettings as any)[section] = {
            ...(newSettings as any)[section],
            [key]: value,
          };
        }
      }
      
      // Async update to localStorage
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      } catch (error) {
        console.error('Failed to save settings to localStorage:', error);
      }
      
      return newSettings;
    });
  }, []);

  // Reset to defaults using functional update
  const resetSettings = useCallback(() => {
    setSettings(() => {
      try {
        localStorage.removeItem(SETTINGS_STORAGE_KEY);
        return DEFAULT_SETTINGS;
      } catch (error) {
        console.error('Failed to reset settings:', error);
        throw error;
      }
    });
  }, []);

  // Export settings as JSON
  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  // Import settings from JSON
  const importSettings = useCallback((jsonString: string) => {
    try {
      const imported = JSON.parse(jsonString);
      // Validate structure by merging with defaults
      const validatedSettings = {
        authentication: { ...DEFAULT_SETTINGS.authentication, ...imported.authentication },
        graphrag: { ...DEFAULT_SETTINGS.graphrag, ...imported.graphrag },
        featureSwitches: { ...DEFAULT_SETTINGS.featureSwitches, ...imported.featureSwitches },
      };
      saveSettings(validatedSettings);
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw error;
    }
  }, [saveSettings]);

  return {
    settings,
    isLoaded,
    updateSetting,
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings,
  };
};