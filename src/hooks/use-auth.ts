import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import type { Doc } from "@/convex/_generated/dataModel";

import { useEffect, useState } from "react";

type UserDoc = Doc<"users"> | null | undefined;

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  // Bypass type instantiation by casting the entire call
  const userQuery = (useQuery as any)(api.users.currentUser);
  const user = userQuery as UserDoc;
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