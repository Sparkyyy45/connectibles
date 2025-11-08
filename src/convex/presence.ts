import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Update user's last active timestamp
export const updatePresence = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    await ctx.db.patch(userId, {
      lastActive: Date.now(),
    });
  },
});

// Check if a user is online (active within last 5 minutes)
export const isUserOnline = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.lastActive) return false;

    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return user.lastActive > fiveMinutesAgo;
  },
});

// Get online status for multiple users
export const getOnlineStatuses = query({
  args: { userIds: v.array(v.id("users")) },
  handler: async (ctx, args) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    const statuses = await Promise.all(
      args.userIds.map(async (userId) => {
        const user = await ctx.db.get(userId);
        const isOnline = user?.lastActive ? user.lastActive > fiveMinutesAgo : false;
        return { userId, isOnline };
      })
    );

    return statuses;
  },
});
