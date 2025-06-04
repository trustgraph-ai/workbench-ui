//
// Usage:
//   useActivity("Doing some whatever activity", booleanExpression);
//
// Starts the activity notification, and removes automatically when no
// longer true.
//

import { useEffect } from "react";

import { useProgressStateStore } from "./progress";

export const useActivity = (isActive, description) => {
  const addActivity = useProgressStateStore((state) => state.addActivity);
  const removeActivity = useProgressStateStore(
    (state) => state.removeActivity,
  );

  useEffect(() => {
    if (isActive) {
      addActivity(description);
      return () => removeActivity(description);
    }
  }, [isActive, description, addActivity, removeActivity]);
};
