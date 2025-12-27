import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Start a new singleplayer game session
export const startGame = mutation({
  args: {
    gameType: v.union(
      v.literal("tic_tac_toe"),
      v.literal("reaction_test")
    ),
    difficulty: v.optional(v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check for existing active session
    const existingSession = await ctx.db
      .query("game_sessions")
      .withIndex("by_player", (q) => q.eq("playerId", userId))
      .filter((q) => q.eq(q.field("status"), "in_progress"))
      .first();

    if (existingSession) {
      // If same game type, return existing session
      if (existingSession.gameType === args.gameType) {
        return existingSession._id;
      }
      // If different game type, mark old one as completed (abandoned)
      await ctx.db.patch(existingSession._id, { 
        status: "completed",
        result: "loss" // Abandoning counts as loss
      });
    }

    const sessionId = await ctx.db.insert("game_sessions", {
      gameType: args.gameType,
      playerId: userId,
      status: "in_progress",
      gameState: JSON.stringify({}),
      difficulty: args.difficulty,
    });

    return sessionId;
  },
});

// Get active game sessions for the current user
export const getActiveSessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const sessions = await ctx.db
      .query("game_sessions")
      .withIndex("by_player", (q) => q.eq("playerId", userId))
      .filter((q) => q.eq(q.field("status"), "in_progress"))
      .collect();

    return sessions;
  },
});

// Update game state and complete game
export const updateGameState = mutation({
  args: {
    sessionId: v.id("game_sessions"),
    gameState: v.string(),
    result: v.optional(v.union(
      v.literal("win"),
      v.literal("loss"),
      v.literal("draw")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    if (session.playerId !== userId) {
      throw new Error("Not your game session");
    }

    if (session.status === "completed") {
      throw new Error("Game already completed");
    }

    const updates: any = {
      gameState: args.gameState,
    };

    if (args.result !== undefined) {
      updates.result = args.result;
      updates.status = "completed";
      
      // Update game statistics
      await ctx.scheduler.runAfter(0, internal.gameStats.updateGameStats, {
        sessionId: args.sessionId,
      });
    }

    await ctx.db.patch(args.sessionId, updates);
    return args.sessionId;
  },
});