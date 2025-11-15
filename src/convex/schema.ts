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
      
      // NEW: Personality & Values
      personalityType: v.optional(v.string()), // Myers-Briggs or Big Five
      topValues: v.optional(v.array(v.string())), // Top 3-5 values
      communicationStyle: v.optional(v.string()), // "Direct", "Diplomatic", "Balanced"
      socialPreference: v.optional(v.string()), // "Introvert", "Extrovert", "Ambivert"
      lifestyleHabits: v.optional(v.array(v.string())), // ["Morning Person", "Active", "Organized"]
      
      // NEW: Goals & Aspirations
      careerGoals: v.optional(v.array(v.string())),
      learningGoals: v.optional(v.array(v.string())),
      projectInterests: v.optional(v.array(v.string())),
      timeCommitment: v.optional(v.string()), // "High", "Medium", "Low"
      
      // NEW: Enhanced Academic
      gpaRange: v.optional(v.string()), // "3.5-4.0", "3.0-3.5", etc. (optional)
      favoriteCourses: v.optional(v.array(v.string())),
      studyStyle: v.optional(v.string()), // "Visual", "Auditory", "Kinesthetic", "Mixed"
      academicStrengths: v.optional(v.array(v.string())),
      academicChallenges: v.optional(v.array(v.string())),
      
      // NEW: Preferences & Deal-breakers
      mustHaves: v.optional(v.array(v.string())),
      niceToHaves: v.optional(v.array(v.string())),
      distancePreference: v.optional(v.string()), // "Campus Only", "City Wide", "Anywhere"
      connectionTypePriority: v.optional(v.array(v.string())), // Ranked priorities
      
      // NEW: Behavioral tracking (auto-populated)
      lastActiveTime: v.optional(v.number()),
      responseRate: v.optional(v.number()), // 0-100
      averageResponseTime: v.optional(v.number()), // in minutes
      connectionSuccessRate: v.optional(v.number()), // 0-100
      preferredGames: v.optional(v.array(v.string())),
      
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

    // Game sessions for multiplayer games
    game_sessions: defineTable({
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
      player1Id: v.id("users"),
      player2Id: v.id("users"),
      status: v.union(
        v.literal("waiting"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled")
      ),
      currentTurn: v.optional(v.id("users")),
      gameState: v.optional(v.string()), // JSON stringified game state
      winnerId: v.optional(v.id("users")),
    })
      .index("by_player1", ["player1Id"])
      .index("by_player2", ["player2Id"])
      .index("by_status", ["status"]),

    // Game invitations
    game_invitations: defineTable({
      senderId: v.id("users"),
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
      status: v.union(
        v.literal("pending"),
        v.literal("accepted"),
        v.literal("rejected"),
        v.literal("cancelled")
      ),
      sessionId: v.optional(v.id("game_sessions")),
    })
      .index("by_receiver", ["receiverId"])
      .index("by_sender", ["senderId"]),

    // Game statistics for tracking player performance
    game_stats: defineTable({
      userId: v.id("users"),
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
        completed: v.boolean(),
        timestamp: v.number(),
        answer: v.optional(v.string()),
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