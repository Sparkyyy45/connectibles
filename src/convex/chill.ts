import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const createSpill = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!args.content || args.content.trim().length === 0) {
      throw new Error("Spill content cannot be empty");
    }

    if (args.content.length > 1200) {
      throw new Error("Spill content cannot exceed 1200 characters");
    }

    const postId = await ctx.db.insert("chill_posts", {
      authorId: userId,
      content: args.content.trim(),
    });

    // Notify all connections about the new spill
    const author = await ctx.db.get(userId);
    if (author?.connections && author.connections.length > 0) {
      for (const connectionId of author.connections) {
        await ctx.db.insert("notifications", {
          userId: connectionId,
          type: "new_spill",
          message: `${author.name || "Someone"} just posted a new spill! ✨`,
          relatedUserId: userId,
          read: false,
        });
      }
    }

    return postId;
  },
});

export const getAllSpills = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("chill_posts").order("desc").take(100);
    
    const postsWithScores = posts.map((post) => {
      const upvoteCount = post.upvotes?.length || 0;
      const downvoteCount = post.downvotes?.length || 0;
      const score = upvoteCount - downvoteCount;
      return { ...post, score };
    });

    // Sort by score (most upvotes first)
    postsWithScores.sort((a, b) => b.score - a.score);

    return postsWithScores;
  },
});

export const upvoteSpill = mutation({
  args: {
    postId: v.id("chill_posts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const upvotes = post.upvotes || [];
    const downvotes = post.downvotes || [];
    
    const hasUpvoted = upvotes.includes(userId);
    const hasDownvoted = downvotes.includes(userId);

    if (hasUpvoted) {
      // Remove upvote
      await ctx.db.patch(args.postId, {
        upvotes: upvotes.filter(id => id !== userId),
      });
    } else {
      // Add upvote and remove downvote if exists
      await ctx.db.patch(args.postId, {
        upvotes: [...upvotes, userId],
        downvotes: hasDownvoted ? downvotes.filter(id => id !== userId) : downvotes,
      });
    }

    return args.postId;
  },
});

export const downvoteSpill = mutation({
  args: {
    postId: v.id("chill_posts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const upvotes = post.upvotes || [];
    const downvotes = post.downvotes || [];
    
    const hasUpvoted = upvotes.includes(userId);
    const hasDownvoted = downvotes.includes(userId);

    if (hasDownvoted) {
      // Remove downvote
      await ctx.db.patch(args.postId, {
        downvotes: downvotes.filter(id => id !== userId),
      });
    } else {
      // Add downvote and remove upvote if exists
      await ctx.db.patch(args.postId, {
        downvotes: [...downvotes, userId],
        upvotes: hasUpvoted ? upvotes.filter(id => id !== userId) : upvotes,
      });
    }

    return args.postId;
  },
});

export const deleteSpill = mutation({
  args: { postId: v.id("chill_posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Spill not found");
    if (post.authorId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(args.postId);
    return args.postId;
  },
});

export const deleteOldSpills = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    const oldPosts = await ctx.db
      .query("chill_posts")
      .filter((q) => q.lt(q.field("_creationTime"), twentyFourHoursAgo))
      .collect();

    let deletedCount = 0;
    for (const post of oldPosts) {
      await ctx.db.delete(post._id);
      deletedCount++;
    }

    console.log(`Deleted ${deletedCount} old confessions`);
    return deletedCount;
  },
});