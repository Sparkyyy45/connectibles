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

    const sender = await ctx.db.get(userId);
    const receiver = await ctx.db.get(args.receiverId);

    if (!sender || !receiver) throw new Error("User not found");

    // Check if either user has blocked the other
    const senderBlockedUsers = sender.blockedUsers || [];
    const receiverBlockedUsers = receiver.blockedUsers || [];

    if (senderBlockedUsers.includes(args.receiverId)) {
      throw new Error("BLOCKED_USER: You have blocked this user");
    }

    if (receiverBlockedUsers.includes(userId)) {
      throw new Error("BLOCKED_BY_USER: This user has blocked you");
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

    const currentUser = await ctx.db.get(userId);
    if (!currentUser) return [];

    const blockedUsers = currentUser.blockedUsers || [];
    
    // Don't show conversation if user is blocked
    if (blockedUsers.includes(args.otherUserId)) {
      return [];
    }

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

    const currentUser = await ctx.db.get(userId);
    if (!currentUser) return 0;

    const blockedUsers = currentUser.blockedUsers || [];

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q) => q.eq("receiverId", userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    // Filter out messages from blocked users
    const filteredMessages = unreadMessages.filter(
      msg => !blockedUsers.includes(msg.senderId)
    );

    return filteredMessages.length;
  },
});

export const blockUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    if (currentUserId === args.userId) {
      throw new Error("SELF_BLOCK: You cannot block yourself");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser) throw new Error("User not found");

    const blockedUsers = currentUser.blockedUsers || [];

    if (blockedUsers.includes(args.userId)) {
      throw new Error("ALREADY_BLOCKED: User is already blocked");
    }

    await ctx.db.patch(currentUserId, {
      blockedUsers: [...blockedUsers, args.userId],
    });

    return { success: true };
  },
});

export const unblockUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser) throw new Error("User not found");

    const blockedUsers = currentUser.blockedUsers || [];

    if (!blockedUsers.includes(args.userId)) {
      throw new Error("NOT_BLOCKED: User is not blocked");
    }

    await ctx.db.patch(currentUserId, {
      blockedUsers: blockedUsers.filter(id => id !== args.userId),
    });

    return { success: true };
  },
});

export const isUserBlocked = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return false;

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser) return false;

    const blockedUsers = currentUser.blockedUsers || [];
    return blockedUsers.includes(args.userId);
  },
});