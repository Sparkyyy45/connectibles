import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMatches = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const currentUser = await ctx.db.get(userId);
    if (!currentUser || !currentUser.interests) return [];

    const allUsers = await ctx.db.query("users").collect();
    
    const matches = allUsers
      .filter(user => user._id !== userId && user.interests && user.interests.length > 0)
      .map(user => {
        const sharedInterests = currentUser.interests!.filter(interest =>
          user.interests!.includes(interest)
        );
        return {
          user,
          score: sharedInterests.length,
          sharedInterests,
        };
      })
      .filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return matches;
  },
});
