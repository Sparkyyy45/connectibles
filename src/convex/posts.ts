import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createPost = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const postId = await ctx.db.insert("collaboration_posts", {
      authorId: userId,
      title: args.title,
      description: args.description,
      tags: args.tags,
    });

    return postId;
  },
});

export const volunteerForPost = mutation({
  args: { postId: v.id("collaboration_posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const volunteers = post.volunteers || [];
    const isVolunteering = volunteers.includes(userId);

    if (isVolunteering) {
      await ctx.db.patch(args.postId, {
        volunteers: volunteers.filter((id) => id !== userId),
      });
    } else {
      await ctx.db.patch(args.postId, {
        volunteers: [...volunteers, userId],
      });
    }

    return !isVolunteering;
  },
});

export const getPostVolunteers = query({
  args: { postId: v.id("collaboration_posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post || !post.volunteers) return [];

    const volunteers = await Promise.all(
      post.volunteers.map(async (volunteerId) => {
        return await ctx.db.get(volunteerId);
      })
    );

    return volunteers.filter(v => v !== null);
  },
});

export const getAllPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("collaboration_posts").order("desc").collect();
    
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return { ...post, author };
      })
    );

    return postsWithAuthors;
  },
});

export const getUserPosts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("collaboration_posts")
      .withIndex("by_author", (q) => q.eq("authorId", args.userId))
      .order("desc")
      .collect();
  },
});