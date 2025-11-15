import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createSession = mutation({
  args: { opponentId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if users are connected
    const currentUser = await ctx.db.get(userId);
    if (!currentUser?.connections?.includes(args.opponentId)) {
      throw new Error("You can only play with connected users");
    }

    // Check if there's already an active session
    const existingSession = await ctx.db
      .query("truth_dare_sessions")
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("player1Id"), userId),
            q.eq(q.field("player2Id"), args.opponentId)
          ),
          q.and(
            q.eq(q.field("player1Id"), args.opponentId),
            q.eq(q.field("player2Id"), userId)
          )
        )
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (existingSession) {
      return existingSession._id;
    }

    const sessionId = await ctx.db.insert("truth_dare_sessions", {
      player1Id: userId,
      player2Id: args.opponentId,
      status: "active",
      currentTurn: args.opponentId,
      rounds: [],
    });

    return sessionId;
  },
});

export const getActiveSessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const sessions = await ctx.db
      .query("truth_dare_sessions")
      .filter((q) =>
        q.and(
          q.or(
            q.eq(q.field("player1Id"), userId),
            q.eq(q.field("player2Id"), userId)
          ),
          q.eq(q.field("status"), "active")
        )
      )
      .collect();

    const sessionsWithPlayers = await Promise.all(
      sessions.map(async (session) => {
        const player1 = await ctx.db.get(session.player1Id);
        const player2 = await ctx.db.get(session.player2Id);
        const opponent = session.player1Id === userId ? player2 : player1;
        return { ...session, opponent };
      })
    );

    return sessionsWithPlayers;
  },
});

export const getSession = query({
  args: { sessionId: v.id("truth_dare_sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

    const player1 = await ctx.db.get(session.player1Id);
    const player2 = await ctx.db.get(session.player2Id);

    return { ...session, player1, player2 };
  },
});

export const answerTruth = mutation({
  args: {
    sessionId: v.id("truth_dare_sessions"),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const lastRound = session.rounds[session.rounds.length - 1];
    if (!lastRound || lastRound.completed) {
      throw new Error("No round to answer");
    }

    if (lastRound.choice !== "truth") {
      throw new Error("This is not a truth question");
    }

    // Only the person who received the question can answer
    const questionReceiver = lastRound.playerId === session.player1Id 
      ? session.player2Id 
      : session.player1Id;

    if (userId !== questionReceiver) {
      throw new Error("Only the person answering can respond");
    }

    if (!args.answer.trim()) {
      throw new Error("Answer cannot be empty");
    }

    const updatedRounds = [...session.rounds];
    updatedRounds[updatedRounds.length - 1] = { 
      ...lastRound, 
      completed: true,
      answer: args.answer.trim()
    };

    const nextTurn =
      session.currentTurn === session.player1Id
        ? session.player2Id
        : session.player1Id;

    await ctx.db.patch(args.sessionId, {
      rounds: updatedRounds,
      currentTurn: nextTurn,
    });

    return args.sessionId;
  },
});

export const makeChoice = mutation({
  args: {
    sessionId: v.id("truth_dare_sessions"),
    choice: v.union(v.literal("truth"), v.literal("dare")),
    question: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    if (session.currentTurn !== userId) {
      throw new Error("Not your turn");
    }

    if (!args.question.trim()) {
      throw new Error("Question cannot be empty");
    }

    const newRound = {
      playerId: userId,
      choice: args.choice,
      question: args.question.trim(),
      completed: false,
      timestamp: Date.now(),
    };

    await ctx.db.patch(args.sessionId, {
      rounds: [...session.rounds, newRound],
    });

    return args.sessionId;
  },
});

export const skipRound = mutation({
  args: { sessionId: v.id("truth_dare_sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const lastRound = session.rounds[session.rounds.length - 1];
    if (!lastRound || lastRound.completed) {
      throw new Error("No round to skip");
    }

    // Only the person who received the question can skip
    const questionReceiver = lastRound.playerId === session.player1Id 
      ? session.player2Id 
      : session.player1Id;

    if (userId !== questionReceiver) {
      throw new Error("Only the person answering can skip");
    }

    const updatedRounds = [...session.rounds];
    updatedRounds[updatedRounds.length - 1] = { 
      ...lastRound, 
      completed: true,
      answer: "(Skipped)"
    };

    const nextTurn =
      session.currentTurn === session.player1Id
        ? session.player2Id
        : session.player1Id;

    await ctx.db.patch(args.sessionId, {
      rounds: updatedRounds,
      currentTurn: nextTurn,
    });

    return args.sessionId;
  },
});

export const completeRound = mutation({
  args: { sessionId: v.id("truth_dare_sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const lastRound = session.rounds[session.rounds.length - 1];
    if (!lastRound || lastRound.completed) {
      throw new Error("No round to complete");
    }

    const updatedRounds = [...session.rounds];
    updatedRounds[updatedRounds.length - 1] = { ...lastRound, completed: true };

    const nextTurn =
      session.currentTurn === session.player1Id
        ? session.player2Id
        : session.player1Id;

    await ctx.db.patch(args.sessionId, {
      rounds: updatedRounds,
      currentTurn: nextTurn,
    });

    return args.sessionId;
  },
});

export const endSession = mutation({
  args: { sessionId: v.id("truth_dare_sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    if (session.player1Id !== userId && session.player2Id !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.sessionId, {
      status: "completed",
    });

    return args.sessionId;
  },
});