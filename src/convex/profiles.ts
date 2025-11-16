import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    image: v.optional(v.string()),
    yearOfStudy: v.optional(v.string()),
    department: v.optional(v.string()),
    matchIntent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(userId, {
      name: args.name,
      bio: args.bio,
      interests: args.interests,
      skills: args.skills,
      location: args.location,
      image: args.image,
      yearOfStudy: args.yearOfStudy,
      department: args.department,
      matchIntent: args.matchIntent,
    });

    return userId;
  },
});

export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const getProfileCompletion = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const user = await ctx.db.get(userId);
    if (!user) return 0;

    let completed = 0;
    const total = 9;

    if (user.name) completed++;
    if (user.image) completed++;
    if (user.bio) completed++;
    if (user.interests && user.interests.length > 0) completed++;
    if (user.skills && user.skills.length > 0) completed++;
    if (user.location) completed++;
    if (user.yearOfStudy) completed++;
    if (user.department) completed++;
    if (user.matchIntent) completed++;

    return Math.round((completed / total) * 100);
  },
});