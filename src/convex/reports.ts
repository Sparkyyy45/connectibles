import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const reportUser = mutation({
  args: { 
    reportedUserId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("AUTH_REQUIRED: Please sign in to report users");

    if (userId === args.reportedUserId) {
      throw new Error("SELF_REPORT: You cannot report yourself");
    }

    // Check if user already reported this person
    const existingReport = await ctx.db
      .query("user_reports")
      .withIndex("by_reporter_and_reported", (q) =>
        q.eq("reporterId", userId).eq("reportedUserId", args.reportedUserId)
      )
      .first();

    if (existingReport) {
      throw new Error("ALREADY_REPORTED: You have already reported this user");
    }

    // Create the report
    await ctx.db.insert("user_reports", {
      reporterId: userId,
      reportedUserId: args.reportedUserId,
      reason: args.reason,
    });

    // Count total reports for this user
    const allReports = await ctx.db
      .query("user_reports")
      .withIndex("by_reported_user", (q) => q.eq("reportedUserId", args.reportedUserId))
      .collect();

    // Ban user if they have 10 or more reports
    if (allReports.length >= 10) {
      await ctx.db.patch(args.reportedUserId, {
        isBanned: true,
      });
    }

    return { reportCount: allReports.length };
  },
});

export const getReportCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const reports = await ctx.db
      .query("user_reports")
      .withIndex("by_reported_user", (q) => q.eq("reportedUserId", args.userId))
      .collect();

    return reports.length;
  },
});

export const hasReported = query({
  args: { reportedUserId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const report = await ctx.db
      .query("user_reports")
      .withIndex("by_reporter_and_reported", (q) =>
        q.eq("reporterId", userId).eq("reportedUserId", args.reportedUserId)
      )
      .first();

    return !!report;
  },
});
