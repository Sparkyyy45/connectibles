import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function usePresence() {
  const updatePresence = useMutation(api.presence.updatePresence);

  useEffect(() => {
    // Update presence immediately
    updatePresence();

    // Update presence every 2 minutes
    const interval = setInterval(() => {
      updatePresence();
    }, 2 * 60 * 1000);

    // Throttle activity updates to once per 30 seconds
    let lastUpdate = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastUpdate > 30000) {
        updatePresence();
        lastUpdate = now;
      }
    };

    window.addEventListener("click", handleActivity);
    window.addEventListener("keydown", handleActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, [updatePresence]);
}
