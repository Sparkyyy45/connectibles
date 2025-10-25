import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendWave = mutation({
  args: { receiverId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (userId === args.receiverId) {
      throw new Error("Cannot wave to yourself");
    }

    // Check if request already exists in either direction
    const existing = await ctx.db
      .query("connection_requests")
      .withIndex("by_sender_and_receiver", (q) =>
        q.eq("senderId", userId).eq("receiverId", args.receiverId)
      )
      .first();

    if (existing) {
      throw new Error("Already sent a wave or connection request");
    }

    const requestId = await ctx.db.insert("connection_requests", {
      senderId: userId,
      receiverId: args.receiverId,
      status: "waved",
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
    if (!userId) throw new Error("Not authenticated");

    if (userId === args.receiverId) {
      throw new Error("Cannot connect with yourself");
    }

    // Check if already connected
    const currentUser = await ctx.db.get(userId);
    if (currentUser?.connections?.includes(args.receiverId)) {
      throw new Error("Already connected");
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
        return existingSent._id;
      }
      throw new Error("Connection request already sent");
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

      if (sender && receiver) {
        await ctx.db.patch(args.receiverId, {
          connections: [...(sender.connections || []), userId],
        });
        await ctx.db.patch(userId, {
          connections: [...(receiver.connections || []), args.receiverId],
        });
      }

      return existingReceived._id;
    }

    const requestId = await ctx.db.insert("connection_requests", {
      senderId: userId,
      receiverId: args.receiverId,
      status: "pending",
    });

    return requestId;
  },
});

export const acceptConnectionRequest = mutation({
  args: { requestId: v.id("connection_requests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request || request.receiverId !== userId) {
      throw new Error("Invalid request");
    }

    if (request.status !== "pending") {
      throw new Error("Request is not pending");
    }

    await ctx.db.patch(args.requestId, { status: "accepted" });

    // Add to connections
    const sender = await ctx.db.get(request.senderId);
    const receiver = await ctx.db.get(request.receiverId);

    if (sender && receiver) {
      await ctx.db.patch(request.senderId, {
        connections: [...(sender.connections || []), request.receiverId],
      });
      await ctx.db.patch(request.receiverId, {
        connections: [...(receiver.connections || []), request.senderId],
      });
    }

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

    const connections = await Promise.all(
      user.connections.map(async (connectionId) => {
        return await ctx.db.get(connectionId);
      })
    );

    return connections.filter(c => c !== null);
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