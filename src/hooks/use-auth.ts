// @ts-nocheck
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";

// Dynamic imports to bypass type inference
const convexReact = require("convex/react");
const apiModule = require("@/convex/_generated/api");

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  
  // Use dynamic access to completely bypass TypeScript's type inference
  const userQuery = convexReact.useQuery(apiModule.api.users.currentUser);
  const user = (userQuery ?? undefined) as any;
  const { signIn, signOut } = useAuthActions();

  const [isLoading, setIsLoading] = useState(true);

  // This effect updates the loading state once auth is loaded and user data is available
  // It ensures we only show content when both authentication state and user data are ready
  useEffect(() => {
    if (!isAuthLoading && user !== undefined) {
      setIsLoading(false);
    }
  }, [isAuthLoading, user]);

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}