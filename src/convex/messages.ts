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

    const messageId = await ctx.db.insert("messages", {
      senderId: userId,
      receiverId: args.receiverId,
      message: args.message,
      read: false,
    });

    return messageId;
  },
});

export const blockUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");
    if (currentUserId === args.userId) throw new Error("Cannot block yourself");

    const user = await ctx.db.get(currentUserId);
    const blockedUsers = user?.blockedUsers || [];
    
    if (!blockedUsers.includes(args.userId)) {
      blockedUsers.push(args.userId);
      await ctx.db.patch(currentUserId, { blockedUsers });
    }
  },
});

export const unblockUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const user = await ctx.db.get(currentUserId);
    const blockedUsers = user?.blockedUsers || [];
    
    await ctx.db.patch(currentUserId, { 
      blockedUsers: blockedUsers.filter(id => id !== args.userId) 
    });
  },
});

export const isUserBlocked = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return false;

    const user = await ctx.db.get(currentUserId);
    const blockedUsers = user?.blockedUsers || [];
    return blockedUsers.includes(args.userId);
  },
});

export const getBlockedUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    const blockedUserIds = user?.blockedUsers || [];
    
    const blockedUsers = await Promise.all(
      blockedUserIds.map(id => ctx.db.get(id))
    );
    
    return blockedUsers.filter(u => u !== null);
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