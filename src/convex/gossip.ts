import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendGossipMessage = mutation({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const messageId = await ctx.db.insert("gossip_messages", {
      senderId: userId,
      message: args.message,
      reactions: [],
    });

    return messageId;
  },
});

export const getAllGossipMessages = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db
      .query("gossip_messages")
      .order("desc")
      .take(100);

    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return { ...message, sender };
      })
    );

    return messagesWithSenders.reverse();
  },
});

export const addGossipReaction = mutation({
  args: {
    messageId: v.id("gossip_messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const reactions = message.reactions || [];
    const existingReaction = reactions.find(
      (r) => r.userId === userId && r.emoji === args.emoji
    );

    if (existingReaction) {
      await ctx.db.patch(args.messageId, {
        reactions: reactions.filter(
          (r) => !(r.userId === userId && r.emoji === args.emoji)
        ),
      });
    } else {
      await ctx.db.patch(args.messageId, {
        reactions: [...reactions, { userId, emoji: args.emoji }],
      });
    }

    return args.messageId;
  },
});

export const deleteGossipMessage = mutation({
  args: { messageId: v.id("gossip_messages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");
    if (message.senderId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(args.messageId);
    return args.messageId;
  },
});
