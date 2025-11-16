import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables,

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      isBanned: v.optional(v.boolean()),
      
      // Connectibles specific fields
      bio: v.optional(v.string()),
      interests: v.optional(v.array(v.string())),
      skills: v.optional(v.array(v.string())),
      location: v.optional(v.string()),
      connections: v.optional(v.array(v.id("users"))),
      
      // Enhanced profile fields for better matching
      yearOfStudy: v.optional(v.string()),
      department: v.optional(v.string()),
      major: v.optional(v.string()),
      lookingFor: v.optional(v.array(v.string())), // e.g., "Study Partner", "Project Collaborator", "Friend"
      availability: v.optional(v.string()), // e.g., "Weekends", "Evenings", "Flexible"
      
      // Profile prompts for personality
      studySpot: v.optional(v.string()),
      favoriteSubject: v.optional(v.string()),
      weekendActivity: v.optional(v.string()),
      superpower: v.optional(v.string()),
      
      // Online status tracking
      lastActive: v.optional(v.number()),
    }).index("email", ["email"]),

    // Notifications
    notifications: defineTable({
      userId: v.id("users"),
      type: v.string(),
      message: v.string(),
      relatedUserId: v.optional(v.id("users")),
      read: v.boolean(),
    }).index("by_user", ["userId"]),

    // User reports for moderation
    user_reports: defineTable({
      reporterId: v.id("users"),
      reportedUserId: v.id("users"),
      reason: v.optional(v.string()),
    })
      .index("by_reported_user", ["reportedUserId"])
      .index("by_reporter_and_reported", ["reporterId", "reportedUserId"]),

    // Chill posts - creative content sharing
    chill_posts: defineTable({
      authorId: v.id("users"),
      content: v.optional(v.string()),
      upvotes: v.optional(v.array(v.id("users"))),
      downvotes: v.optional(v.array(v.id("users"))),
    }).index("by_author", ["authorId"]),

    // Collaboration posts
    collaboration_posts: defineTable({
      authorId: v.id("users"),
      title: v.string(),
      description: v.string(),
      tags: v.array(v.string()),
      volunteers: v.optional(v.array(v.id("users"))),
    }).index("by_author", ["authorId"]),

    // Messages between users
    messages: defineTable({
      senderId: v.id("users"),
      receiverId: v.id("users"),
      message: v.string(),
      read: v.boolean(),
    })
      .index("by_receiver", ["receiverId"])
      .index("by_sender", ["senderId"])
      .index("by_conversation", ["senderId", "receiverId"]),

    // Events/Meetups
    events: defineTable({
      creatorId: v.id("users"),
      title: v.string(),
      description: v.string(),
      tags: v.optional(v.array(v.string())),
      location: v.optional(v.string()),
      eventDate: v.optional(v.number()),
      interestedUsers: v.optional(v.array(v.id("users"))),
    }).index("by_creator", ["creatorId"]),

    // Connection requests
    connection_requests: defineTable({
      senderId: v.id("users"),
      receiverId: v.id("users"),
      status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected"), v.literal("waved")),
    })
      .index("by_receiver", ["receiverId"])
      .index("by_sender", ["senderId"])
      .index("by_sender_and_receiver", ["senderId", "receiverId"]),

    // Gossip messages - group chat for everyone
    gossip_messages: defineTable({
      senderId: v.id("users"),
      message: v.string(),
      reactions: v.optional(v.array(v.object({
        userId: v.id("users"),
        emoji: v.string(),
      }))),
    }).index("by_sender", ["senderId"]),

    // Singleplayer game sessions (player vs AI)
    game_sessions: defineTable({
      gameType: v.union(
        v.literal("tic_tac_toe"),
        v.literal("reaction_test")
      ),
      playerId: v.id("users"),
      status: v.union(
        v.literal("in_progress"),
        v.literal("completed")
      ),
      gameState: v.optional(v.string()), // JSON stringified game state
      result: v.optional(v.union(
        v.literal("win"),
        v.literal("loss"),
        v.literal("draw")
      )),
      difficulty: v.optional(v.union(
        v.literal("easy"),
        v.literal("medium"),
        v.literal("hard")
      )),
    })
      .index("by_player", ["playerId"])
      .index("by_status", ["status"]),

    // Game statistics for tracking player performance
    game_stats: defineTable({
      userId: v.id("users"),
      gameType: v.union(
        v.literal("tic_tac_toe"),
        v.literal("reaction_test")
      ),
      wins: v.number(),
      losses: v.number(),
      draws: v.number(),
      totalGames: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_game", ["userId", "gameType"]),

    // Truth and Dare game sessions
    truth_dare_sessions: defineTable({
      player1Id: v.id("users"),
      player2Id: v.id("users"),
      status: v.union(
        v.literal("active"),
        v.literal("completed")
      ),
      currentTurn: v.id("users"),
      rounds: v.array(v.object({
        playerId: v.id("users"),
        choice: v.union(v.literal("truth"), v.literal("dare")),
        question: v.string(),
        answer: v.optional(v.string()),
        completed: v.boolean(),
        timestamp: v.number(),
      })),
    })
      .index("by_player1", ["player1Id"])
      .index("by_player2", ["player2Id"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;