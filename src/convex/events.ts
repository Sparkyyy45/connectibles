import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    tags: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    eventDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const eventId = await ctx.db.insert("events", {
      creatorId: userId,
      title: args.title,
      description: args.description,
      tags: args.tags || [],
      location: args.location,
      eventDate: args.eventDate,
      interestedUsers: [],
    });

    return eventId;
  },
});

export const getAllEvents = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("events").order("desc").collect();
    
    const eventsWithCreators = await Promise.all(
      events.map(async (event) => {
        const creator = await ctx.db.get(event.creatorId);
        return { ...event, creator };
      })
    );

    return eventsWithCreators;
  },
});

export const toggleInterest = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    const interestedUsers = event.interestedUsers || [];
    const isInterested = interestedUsers.includes(userId);

    if (isInterested) {
      await ctx.db.patch(args.eventId, {
        interestedUsers: interestedUsers.filter((id) => id !== userId),
      });
    } else {
      await ctx.db.patch(args.eventId, {
        interestedUsers: [...interestedUsers, userId],
      });
    }

    return !isInterested;
  },
});
