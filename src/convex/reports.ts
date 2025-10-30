import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

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

    const reportCount = allReports.length;

    // Send notification to the reported user
    if (reportCount === 1) {
      // First report - gentle warning
      await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
        userId: args.reportedUserId,
        type: "report_warning",
        message: "⚠️ A community member has reported your behavior. Please ensure you're being respectful and following community guidelines. Continued violations may result in account restrictions.",
      });
    } else if (reportCount === 5) {
      // Halfway warning
      await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
        userId: args.reportedUserId,
        type: "report_warning",
        message: `⚠️ You have received ${reportCount} reports. This is a serious concern. Please review our community guidelines and adjust your behavior accordingly. Further reports will result in account suspension.`,
      });
    } else if (reportCount === 8) {
      // Final warning
      await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
        userId: args.reportedUserId,
        type: "report_warning",
        message: `🚨 Final Warning: You have received ${reportCount} reports. Your account is at risk of being banned. Please be respectful and follow community guidelines immediately.`,
      });
    }

    // Ban user if they have 10 or more reports
    if (reportCount >= 10) {
      await ctx.db.patch(args.reportedUserId, {
        isBanned: true,
      });
      
      // Send ban notification
      await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
        userId: args.reportedUserId,
        type: "account_banned",
        message: "🚫 Your account has been suspended due to multiple community guideline violations. If you believe this is an error, please contact support.",
      });
    }

    return { reportCount };
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