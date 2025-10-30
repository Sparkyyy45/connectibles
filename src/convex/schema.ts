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
    }).index("email", ["email"]),

    // Notifications
    notifications: defineTable({
      userId: v.id("users"),
      type: v.string(),
      message: v.string(),
      relatedUserId: v.optional(v.id("users")),
      read: v.boolean(),
    }).index("by_user", ["userId"]),

    // Chill posts - creative content sharing
    chill_posts: defineTable({
      authorId: v.id("users"),
      content: v.optional(v.string()),
      mediaUrl: v.optional(v.string()),
      mediaType: v.optional(v.union(
        v.literal("image"),
        v.literal("doodle"),
        v.literal("sticker"),
        v.literal("music"),
        v.literal("other")
      )),
      reactions: v.optional(v.array(v.object({
        userId: v.id("users"),
        emoji: v.string(),
      }))),
      // Position for freeform placement
      positionX: v.optional(v.number()),
      positionY: v.optional(v.number()),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      zIndex: v.optional(v.number()),
      rotation: v.optional(v.number()),
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
        v.literal("reaction_test")
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
        v.literal("reaction_test")
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
  },
  {
    schemaValidation: false,
  },
);

export default schema;