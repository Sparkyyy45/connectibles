import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Update game statistics after a game completes
export const updateGameStats = internalMutation({
  args: {
    sessionId: v.id("game_sessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.status !== "completed") {
      throw new Error("Invalid or incomplete game session");
    }

    const playerId = session.playerId;
    const result = session.result;
    const gameType = session.gameType;

    // Find existing stats
    const existingStats = await ctx.db
      .query("game_stats")
      .withIndex("by_user_and_game", (q) =>
        q.eq("userId", playerId).eq("gameType", gameType)
      )
      .first();

    let wins = 0;
    let losses = 0;
    let draws = 0;

    if (result === "win") {
      wins = 1;
    } else if (result === "draw") {
      draws = 1;
    } else if (result === "loss") {
      losses = 1;
    }

    if (existingStats) {
      // Update existing stats
      await ctx.db.patch(existingStats._id, {
        wins: existingStats.wins + wins,
        losses: existingStats.losses + losses,
        draws: existingStats.draws + draws,
        totalGames: existingStats.totalGames + 1,
      });
    } else {
      // Create new stats entry
      await ctx.db.insert("game_stats", {
        userId: playerId,
        gameType,
        wins,
        losses,
        draws,
        totalGames: 1,
      });
    }
  },
});

// Get overall game statistics for a user
export const getUserGameStats = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const userId = args.userId || (await getAuthUserId(ctx));
    if (!userId) return null;

    const stats = await ctx.db
      .query("game_stats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Calculate overall stats
    const overall = {
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
    };

    stats.forEach((stat) => {
      overall.totalGames += stat.totalGames;
      overall.wins += stat.wins;
      overall.losses += stat.losses;
      overall.draws += stat.draws;
    });

    if (overall.totalGames > 0) {
      overall.winRate = Math.round((overall.wins / overall.totalGames) * 100);
    }

    return {
      overall,
      byGame: stats,
    };
  },
});

// Get leaderboard for a specific game type
export const getGameLeaderboard = query({
  args: {
    gameType: v.union(
      v.literal("tic_tac_toe"),
      v.literal("reaction_test"),
      v.literal("glow_hockey")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const stats = await ctx.db
      .query("game_stats")
      .collect();

    // Filter by game type and calculate win rate
    const gameStats = stats
      .filter((stat) => stat.gameType === args.gameType)
      .map((stat) => ({
        ...stat,
        winRate: stat.totalGames > 0 ? (stat.wins / stat.totalGames) * 100 : 0,
      }))
      .sort((a, b) => {
        // Sort by wins first, then by win rate
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.winRate - a.winRate;
      })
      .slice(0, limit);

    // Fetch user details
    const leaderboard = await Promise.all(
      gameStats.map(async (stat) => {
        const user = await ctx.db.get(stat.userId);
        return {
          ...stat,
          user,
        };
      })
    );

    return leaderboard;
  },
});

// Get overall leaderboard across all games
export const getOverallLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const allStats = await ctx.db.query("game_stats").collect();

    // Group by user and calculate totals
    const userStatsMap = new Map();

    allStats.forEach((stat) => {
      const userId = stat.userId;
      if (!userStatsMap.has(userId)) {
        userStatsMap.set(userId, {
          userId,
          totalGames: 0,
          wins: 0,
          losses: 0,
          draws: 0,
        });
      }

      const userStats = userStatsMap.get(userId);
      userStats.totalGames += stat.totalGames;
      userStats.wins += stat.wins;
      userStats.losses += stat.losses;
      userStats.draws += stat.draws;
    });

    // Convert to array and calculate win rate
    const leaderboardData = Array.from(userStatsMap.values())
      .map((stat) => ({
        ...stat,
        winRate: stat.totalGames > 0 ? (stat.wins / stat.totalGames) * 100 : 0,
      }))
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.winRate - a.winRate;
      })
      .slice(0, limit);

    // Fetch user details
    const leaderboard = await Promise.all(
      leaderboardData.map(async (stat) => {
        const user = await ctx.db.get(stat.userId);
        return {
          ...stat,
          user,
        };
      })
    );

    return leaderboard;
  },
});