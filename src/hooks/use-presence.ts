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

    // Update on user activity
    const handleActivity = () => {
      updatePresence();
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
    };
  }, [updatePresence]);
}
