import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every 6 hours to clean up old confessions (24+ hours old)
// Reduced frequency to minimize function calls and stay within free tier
crons.interval(
  "delete old confessions",
  { hours: 6 },
  internal.chill.deleteOldSpills,
  {}
);

export default crons;