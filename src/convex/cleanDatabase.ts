import { internalMutation } from "./_generated/server";

export const cleanAllData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Delete all notifications
    const notifications = await ctx.db.query("notifications").collect();
    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    // Delete all messages
    const messages = await ctx.db.query("messages").collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete all connection requests
    const connectionRequests = await ctx.db.query("connection_requests").collect();
    for (const request of connectionRequests) {
      await ctx.db.delete(request._id);
    }

    // Delete all blocked users
    const blockedUsers = await ctx.db.query("blocked_users").collect();
    for (const blocked of blockedUsers) {
      await ctx.db.delete(blocked._id);
    }

    // Delete all chill posts
    const chillPosts = await ctx.db.query("chill_posts").collect();
    for (const post of chillPosts) {
      await ctx.db.delete(post._id);
    }

    // Delete all collaboration posts
    const collabPosts = await ctx.db.query("collaboration_posts").collect();
    for (const post of collabPosts) {
      await ctx.db.delete(post._id);
    }

    // Delete all events
    const events = await ctx.db.query("events").collect();
    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    // Delete all gossip messages
    const gossipMessages = await ctx.db.query("gossip_messages").collect();
    for (const gossip of gossipMessages) {
      await ctx.db.delete(gossip._id);
    }

    // Delete all game sessions
    const gameSessions = await ctx.db.query("game_sessions").collect();
    for (const session of gameSessions) {
      await ctx.db.delete(session._id);
    }

    // Delete all game stats
    const gameStats = await ctx.db.query("game_stats").collect();
    for (const stat of gameStats) {
      await ctx.db.delete(stat._id);
    }

    // Delete all truth dare sessions
    const truthDareSessions = await ctx.db.query("truth_dare_sessions").collect();
    for (const session of truthDareSessions) {
      await ctx.db.delete(session._id);
    }

    // Delete all user reports
    const userReports = await ctx.db.query("user_reports").collect();
    for (const report of userReports) {
      await ctx.db.delete(report._id);
    }

    // Delete all users (except auth tables which are managed by Convex Auth)
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    return {
      success: true,
      deletedCounts: {
        notifications: notifications.length,
        messages: messages.length,
        connectionRequests: connectionRequests.length,
        blockedUsers: blockedUsers.length,
        chillPosts: chillPosts.length,
        collabPosts: collabPosts.length,
        events: events.length,
        gossipMessages: gossipMessages.length,
        gameSessions: gameSessions.length,
        gameStats: gameStats.length,
        truthDareSessions: truthDareSessions.length,
        userReports: userReports.length,
        users: users.length,
      }
    };
  },
});
