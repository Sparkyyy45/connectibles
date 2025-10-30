import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const TRUTH_QUESTIONS = [
  "What's the most embarrassing thing you've done in college?",
  "Who was your first crush and why?",
  "What's a secret you've never told anyone?",
  "What's the worst grade you've ever gotten?",
  "Have you ever cheated on a test?",
  "What's your biggest fear?",
  "Who do you have a crush on right now?",
  "What's the most childish thing you still do?",
  "What's your biggest insecurity?",
  "Have you ever lied to your best friend?",
  "What's the most trouble you've gotten into?",
  "What's something you're glad your parents don't know about?",
  "Who in this college would you want to kiss?",
  "What's your most embarrassing moment in class?",
  "Have you ever ghosted someone? Why?",
];

const DARE_CHALLENGES = [
  "Send a funny selfie to your crush",
  "Post an embarrassing photo on your story",
  "Text your crush 'hey' right now",
  "Do 20 pushups",
  "Sing your favorite song out loud",
  "Call a random contact and say 'I love you'",
  "Dance for 30 seconds with no music",
  "Speak in an accent for the next 3 rounds",
  "Let the other player post anything on your story",
  "Share your most embarrassing photo",
  "Do your best impression of a professor",
  "Eat a spoonful of a condiment",
  "Wear your clothes backwards for an hour",
  "Do a dramatic reading of the last text you sent",
  "Let the other player send a text from your phone",
];

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

export const makeChoice = mutation({
  args: {
    sessionId: v.id("truth_dare_sessions"),
    choice: v.union(v.literal("truth"), v.literal("dare")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    if (session.currentTurn !== userId) {
      throw new Error("Not your turn");
    }

    const question =
      args.choice === "truth"
        ? TRUTH_QUESTIONS[Math.floor(Math.random() * TRUTH_QUESTIONS.length)]
        : DARE_CHALLENGES[Math.floor(Math.random() * DARE_CHALLENGES.length)];

    const newRound = {
      playerId: userId,
      choice: args.choice,
      question,
      completed: false,
      timestamp: Date.now(),
    };

    await ctx.db.patch(args.sessionId, {
      rounds: [...session.rounds, newRound],
    });

    return question;
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
