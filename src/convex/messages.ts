import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendMessage = mutation({
  args: {
    receiverId: v.id("users"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if the sender is blocked by the receiver
    const isBlocked = await ctx.db
      .query("blocked_users")
      .withIndex("by_blocker_and_blocked", (q) =>
        q.eq("blockerId", args.receiverId).eq("blockedUserId", userId)
      )
      .first();

    if (isBlocked) {
      throw new Error("BLOCKED: You cannot send messages to this user");
    }

    const messageId = await ctx.db.insert("messages", {
      senderId: userId,
      receiverId: args.receiverId,
      message: args.message,
      read: false,
    });

    return messageId;
  },
});

export const getConversation = query({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const messages = await ctx.db.query("messages").collect();
    
    const conversation = messages.filter(
      (msg) =>
        (msg.senderId === userId && msg.receiverId === args.otherUserId) ||
        (msg.senderId === args.otherUserId && msg.receiverId === userId)
    );

    return conversation.sort((a, b) => a._creationTime - b._creationTime);
  },
});

export const markAsRead = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, { read: true });
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q) => q.eq("receiverId", userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    return unreadMessages.length;
  },
});

export const blockUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    if (currentUserId === args.userId) {
      throw new Error("You cannot block yourself");
    }

    // Check if already blocked
    const existingBlock = await ctx.db
      .query("blocked_users")
      .withIndex("by_blocker_and_blocked", (q) =>
        q.eq("blockerId", currentUserId).eq("blockedUserId", args.userId)
      )
      .first();

    if (existingBlock) {
      throw new Error("User is already blocked");
    }

    await ctx.db.insert("blocked_users", {
      blockerId: currentUserId,
      blockedUserId: args.userId,
    });

    return { success: true };
  },
});

export const unblockUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const blockRecord = await ctx.db
      .query("blocked_users")
      .withIndex("by_blocker_and_blocked", (q) =>
        q.eq("blockerId", currentUserId).eq("blockedUserId", args.userId)
      )
      .first();

    if (!blockRecord) {
      throw new Error("User is not blocked");
    }

    await ctx.db.delete(blockRecord._id);

    return { success: true };
  },
});

export const isUserBlocked = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return false;

    const blockRecord = await ctx.db
      .query("blocked_users")
      .withIndex("by_blocker_and_blocked", (q) =>
        q.eq("blockerId", currentUserId).eq("blockedUserId", args.userId)
      )
      .first();

    return !!blockRecord;
  },
});
