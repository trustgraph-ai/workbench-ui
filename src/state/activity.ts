import { useEffect } from "react";
import { useProgressStateStore } from "./progress";

/**
 * Custom hook for managing activity notifications in the UI
 * Automatically adds/removes activity indicators based on a boolean condition
 *
 * @param {boolean} isActive - Boolean condition that determines if activity
 * is ongoing
 * @param {string} description - Description text to display for the activity
 *
 * @example
 * // Show "Loading documents" while documentsQuery.isLoading is true
 * useActivity(documentsQuery.isLoading, "Loading documents");
 *
 * @example
 * // Show "Saving data" while mutation is pending
 * useActivity(saveMutation.isPending, "Saving data");
 */
export const useActivity = (isActive, description) => {
  // Get activity management functions from the progress state store
  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  useEffect(() => {
    // Only manage activity when isActive is true
    if (isActive) {
      // Add the activity to the progress state
      addActivity(description);

      // Return cleanup function to remove activity when effect cleans up
      // This ensures activity is removed when:
      // - isActive becomes false
      // - description changes
      // - component unmounts
      return () => removeActivity(description);
    }
    // Re-run effect when any dependency changes
  }, [isActive, description, addActivity, removeActivity]);
};
