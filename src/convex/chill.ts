import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const createChillPost = mutation({
  args: {
    content: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    mediaType: v.optional(v.union(
      v.literal("image"),
      v.literal("doodle"),
      v.literal("sticker"),
      v.literal("music"),
      v.literal("other")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // If storageId is provided, get the URL
    let finalMediaUrl: string | undefined = args.mediaUrl;
    if (args.storageId) {
      const url = await ctx.storage.getUrl(args.storageId);
      finalMediaUrl = url ?? undefined;
    }

    const postId = await ctx.db.insert("chill_posts", {
      authorId: userId,
      content: args.content,
      mediaUrl: finalMediaUrl || undefined,
      mediaType: args.mediaType,
      reactions: [],
    });

    return postId;
  },
});

export const getAllChillPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("chill_posts").order("desc").collect();
    
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return { ...post, author };
      })
    );

    return postsWithAuthors;
  },
});

export const addReaction = mutation({
  args: {
    postId: v.id("chill_posts"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const reactions = post.reactions || [];
    const existingReaction = reactions.find(r => r.userId === userId && r.emoji === args.emoji);

    if (existingReaction) {
      await ctx.db.patch(args.postId, {
        reactions: reactions.filter(r => !(r.userId === userId && r.emoji === args.emoji)),
      });
    } else {
      await ctx.db.patch(args.postId, {
        reactions: [...reactions, { userId, emoji: args.emoji }],
      });
    }

    return args.postId;
  },
});

export const deleteChillPost = mutation({
  args: { postId: v.id("chill_posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(args.postId);
    return args.postId;
  },
});