import { cronJobs } from "convex/server";

const crons = cronJobs();

// Cron jobs can be added here when needed
// Example: crons.interval("job name", { hours: 1 }, internal.module.function, {});

export default crons;