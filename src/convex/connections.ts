import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const sendWave = mutation({
  args: { receiverId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("AUTH_REQUIRED: Please sign in to send a wave");

    if (userId === args.receiverId) {
      throw new Error("SELF_WAVE: You cannot wave to yourself");
    }

    // Check if request already exists in either direction
    const existing = await ctx.db
      .query("connection_requests")
      .withIndex("by_sender_and_receiver", (q) =>
        q.eq("senderId", userId).eq("receiverId", args.receiverId)
      )
      .first();

    if (existing) {
      if (existing.status === "waved") {
        throw new Error("ALREADY_WAVED: You've already waved to this user");
      }
      throw new Error("REQUEST_EXISTS: You've already sent a connection request to this user");
    }

    const requestId = await ctx.db.insert("connection_requests", {
      senderId: userId,
      receiverId: args.receiverId,
      status: "waved",
    });

    // Create notification for the receiver
    const sender = await ctx.db.get(userId);
    await ctx.db.insert("notifications", {
      userId: args.receiverId,
      type: "wave",
      message: `${sender?.name || "Someone"} waved at you! 👋`,
      relatedUserId: userId,
      read: false,
    });

    return requestId;
  },
});

export const upgradeWaveToConnection = mutation({
  args: { requestId: v.id("connection_requests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request || request.senderId !== userId) {
      throw new Error("Invalid request");
    }

    if (request.status !== "waved") {
      throw new Error("Can only upgrade waves");
    }

    await ctx.db.patch(args.requestId, { status: "pending" });

    return args.requestId;
  },
});

export const sendConnectionRequest = mutation({
  args: { receiverId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("AUTH_REQUIRED: Please sign in to send a connection request");

    if (userId === args.receiverId) {
      throw new Error("SELF_CONNECT: You cannot connect with yourself");
    }

    // Check if already connected
    const currentUser = await ctx.db.get(userId);
    if (currentUser?.connections?.includes(args.receiverId)) {
      throw new Error("ALREADY_CONNECTED: You're already connected with this user");
    }

    // Check if request already exists from current user to receiver
    const existingSent = await ctx.db
      .query("connection_requests")
      .withIndex("by_sender_and_receiver", (q) =>
        q.eq("senderId", userId).eq("receiverId", args.receiverId)
      )
      .first();

    if (existingSent) {
      // If it's a wave, upgrade it to pending
      if (existingSent.status === "waved") {
        await ctx.db.patch(existingSent._id, { status: "pending" });
        
        // Create notification for the receiver about the connection request
        const sender = await ctx.db.get(userId);
        await ctx.db.insert("notifications", {
          userId: args.receiverId,
          type: "connection_request",
          message: `${sender?.name || "Someone"} sent you a connection request!`,
          relatedUserId: userId,
          read: false,
        });
        
        return existingSent._id;
      }
      throw new Error("REQUEST_PENDING: Connection request already sent");
    }

    // Check if there's a pending request from the other user
    const existingReceived = await ctx.db
      .query("connection_requests")
      .withIndex("by_sender_and_receiver", (q) =>
        q.eq("senderId", args.receiverId).eq("receiverId", userId)
      )
      .first();

    if (existingReceived && existingReceived.status === "pending") {
      // Auto-accept if they both want to connect
      await ctx.db.patch(existingReceived._id, { status: "accepted" });

      // Add to connections
      const sender = await ctx.db.get(args.receiverId);
      const receiver = await ctx.db.get(userId);

      if (!sender || !receiver) {
        throw new Error("USER_NOT_FOUND: One of the users no longer exists");
      }

      await ctx.db.patch(args.receiverId, {
        connections: [...(sender.connections || []), userId],
      });
      await ctx.db.patch(userId, {
        connections: [...(receiver.connections || []), args.receiverId],
      });

      // Create notifications for both users about the connection
      await ctx.db.insert("notifications", {
        userId: args.receiverId,
        type: "connection_accepted",
        message: `You're now connected with ${receiver?.name || "someone"}!`,
        relatedUserId: userId,
        read: false,
      });
      
      await ctx.db.insert("notifications", {
        userId: userId,
        type: "connection_accepted",
        message: `You're now connected with ${sender?.name || "someone"}!`,
        relatedUserId: args.receiverId,
        read: false,
      });

      return existingReceived._id;
    }

    const requestId = await ctx.db.insert("connection_requests", {
      senderId: userId,
      receiverId: args.receiverId,
      status: "pending",
    });

    // Create notification for the receiver
    const sender = await ctx.db.get(userId);
    await ctx.db.insert("notifications", {
      userId: args.receiverId,
      type: "connection_request",
      message: `${sender?.name || "Someone"} sent you a connection request!`,
      relatedUserId: userId,
      read: false,
    });

    return requestId;
  },
});

export const acceptConnectionRequest = mutation({
  args: { requestId: v.id("connection_requests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("AUTH_REQUIRED: Please sign in to accept connection requests");

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("REQUEST_NOT_FOUND: This connection request no longer exists");
    }
    
    if (request.receiverId !== userId) {
      throw new Error("UNAUTHORIZED: You can only accept requests sent to you");
    }

    if (request.status !== "pending") {
      if (request.status === "accepted") {
        throw new Error("ALREADY_ACCEPTED: This request has already been accepted");
      }
      throw new Error("INVALID_STATUS: This request cannot be accepted");
    }

    await ctx.db.patch(args.requestId, { status: "accepted" });

    // Add to connections
    const sender = await ctx.db.get(request.senderId);
    const receiver = await ctx.db.get(request.receiverId);

    if (!sender || !receiver) {
      throw new Error("USER_NOT_FOUND: One of the users no longer exists");
    }

    await ctx.db.patch(request.senderId, {
      connections: [...(sender.connections || []), request.receiverId],
    });
    await ctx.db.patch(request.receiverId, {
      connections: [...(receiver.connections || []), request.senderId],
    });

    // Create notification for the sender that their request was accepted
    await ctx.db.insert("notifications", {
      userId: request.senderId,
      type: "connection_accepted",
      message: `${receiver?.name || "Someone"} accepted your connection request!`,
      relatedUserId: userId,
      read: false,
    });

    return args.requestId;
  },
});

export const getConnectionRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const requests = await ctx.db
      .query("connection_requests")
      .withIndex("by_receiver", (q) => q.eq("receiverId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const requestsWithSenders = await Promise.all(
      requests.map(async (request) => {
        const sender = await ctx.db.get(request.senderId);
        return { ...request, sender };
      })
    );

    return requestsWithSenders;
  },
});

export const getConnections = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    if (!user || !user.connections) return [];

    // Get all blocked users
    const blockedUsers = await ctx.db
      .query("blocked_users")
      .withIndex("by_blocker", (q) => q.eq("blockerId", userId))
      .collect();
    
    const blockedUserIds = new Set(blockedUsers.map(b => b.blockedUserId));

    const connections = await Promise.all(
      user.connections.map(async (connectionId) => {
        return await ctx.db.get(connectionId);
      })
    );

    // Filter out blocked users from connections
    return connections.filter(c => c !== null && !blockedUserIds.has(c._id));
  },
});

export const getConnectionStatus = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return null;

    const currentUser = await ctx.db.get(currentUserId);
    if (currentUser?.connections?.includes(args.userId)) {
      return "connected";
    }

    const sentRequest = await ctx.db
      .query("connection_requests")
      .withIndex("by_sender_and_receiver", (q) =>
        q.eq("senderId", currentUserId).eq("receiverId", args.userId)
      )
      .first();

    if (sentRequest) {
      if (sentRequest.status === "pending") return "pending";
      if (sentRequest.status === "waved") return "waved";
    }

    return "none";
  },
});