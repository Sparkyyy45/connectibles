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
    }).index("email", ["email"]),

    // Collaboration posts
    collaboration_posts: defineTable({
      authorId: v.id("users"),
      title: v.string(),
      description: v.string(),
      tags: v.array(v.string()),
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
      status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
    })
      .index("by_receiver", ["receiverId"])
      .index("by_sender", ["senderId"])
      .index("by_sender_and_receiver", ["senderId", "receiverId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;