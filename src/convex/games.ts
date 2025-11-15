import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Send a game invitation
export const sendGameInvitation = mutation({
  args: {
    receiverId: v.id("users"),
    gameType: v.union(
      v.literal("tic_tac_toe"),
      v.literal("memory_match"),
      v.literal("reaction_test"),
      v.literal("word_chain"),
      v.literal("quick_draw"),
      v.literal("trivia_duel"),
      v.literal("number_guess"),
      v.literal("emoji_match")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (userId === args.receiverId) {
      throw new Error("Cannot invite yourself to a game");
    }

    // Check if users are connected
    const currentUser = await ctx.db.get(userId);
    if (!currentUser?.connections?.includes(args.receiverId)) {
      throw new Error("You can only invite connections to play games");
    }

    const invitationId = await ctx.db.insert("game_invitations", {
      senderId: userId,
      receiverId: args.receiverId,
      gameType: args.gameType,
      status: "pending",
    });

    // Create notification
    const sender = await ctx.db.get(userId);
    if (sender) {
      await ctx.db.insert("notifications", {
        userId: args.receiverId,
        type: "game_invitation",
        message: `${sender.name || "Someone"} invited you to play ${args.gameType.replace("_", " ")}!`,
        relatedUserId: userId,
        read: false,
      });
    }

    return invitationId;
  },
});

// Accept game invitation
export const acceptGameInvitation = mutation({
  args: { invitationId: v.id("game_invitations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation || invitation.receiverId !== userId) {
      throw new Error("Invalid invitation");
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation already processed");
    }

    // Create game session
    const sessionId = await ctx.db.insert("game_sessions", {
      gameType: invitation.gameType,
      player1Id: invitation.senderId,
      player2Id: invitation.receiverId,
      status: "in_progress",
      currentTurn: invitation.senderId,
      gameState: JSON.stringify({}),
    });

    // Update invitation
    await ctx.db.patch(args.invitationId, {
      status: "accepted",
      sessionId,
    });

    // Notify sender
    const receiver = await ctx.db.get(userId);
    if (receiver) {
      await ctx.db.insert("notifications", {
        userId: invitation.senderId,
        type: "game_accepted",
        message: `${receiver.name || "Someone"} accepted your game invitation!`,
        relatedUserId: userId,
        read: false,
      });
    }

    return sessionId;
  },
});

// Get pending game invitations
export const getGameInvitations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const invitations = await ctx.db
      .query("game_invitations")
      .withIndex("by_receiver", (q) => q.eq("receiverId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const invitationsWithSenders = await Promise.all(
      invitations.map(async (invitation) => {
        const sender = await ctx.db.get(invitation.senderId);
        return { ...invitation, sender };
      })
    );

    return invitationsWithSenders;
  },
});

// Get active game sessions
export const getActiveSessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const sessions = await ctx.db
      .query("game_sessions")
      .filter((q) =>
        q.or(
          q.eq(q.field("player1Id"), userId),
          q.eq(q.field("player2Id"), userId)
        )
      )
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "waiting"),
          q.eq(q.field("status"), "in_progress")
        )
      )
      .collect();

    const sessionsWithPlayers = await Promise.all(
      sessions.map(async (session) => {
        const player1 = await ctx.db.get(session.player1Id);
        const player2 = await ctx.db.get(session.player2Id);
        return { ...session, player1, player2 };
      })
    );

    return sessionsWithPlayers;
  },
});

// Update game state
export const updateGameState = mutation({
  args: {
    sessionId: v.id("game_sessions"),
    gameState: v.string(),
    winnerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    if (session.player1Id !== userId && session.player2Id !== userId) {
      throw new Error("Not a player in this session");
    }

    if (session.status === "completed") {
      throw new Error("Game already completed");
    }

    const updates: any = {
      gameState: args.gameState,
    };

    if (args.winnerId !== undefined) {
      updates.winnerId = args.winnerId;
      updates.status = "completed";

      // Notify both players
      const loserId = session.player1Id === args.winnerId ? session.player2Id : session.player1Id;
      
      await ctx.db.insert("notifications", {
        userId: args.winnerId,
        type: "game_won",
        message: `You won the ${session.gameType.replace("_", " ")} game! 🎉`,
        relatedUserId: loserId,
        read: false,
      });

      await ctx.db.insert("notifications", {
        userId: loserId,
        type: "game_lost",
        message: `You lost the ${session.gameType.replace("_", " ")} game. Better luck next time!`,
        relatedUserId: args.winnerId,
        read: false,
      });
    } else {
      // Switch turn
      updates.currentTurn =
        session.currentTurn === session.player1Id
          ? session.player2Id
          : session.player1Id;
    }

    await ctx.db.patch(args.sessionId, updates);
    return args.sessionId;
  },
});

// Leave game session (only if completed)
export const leaveGameSession = mutation({
  args: { sessionId: v.id("game_sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    if (session.player1Id !== userId && session.player2Id !== userId) {
      throw new Error("Not a player in this session");
    }

    if (session.status !== "completed") {
      throw new Error("Cannot leave an active game. Finish the game first!");
    }

    return args.sessionId;
  },
});