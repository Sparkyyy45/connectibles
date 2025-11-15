import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every hour to clean up old confessions (24+ hours old)
crons.interval(
  "delete old confessions",
  { hours: 1 },
  internal.chill.deleteOldSpills,
  {}
);

export default crons;
