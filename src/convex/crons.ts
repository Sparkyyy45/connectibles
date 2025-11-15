import { cronJobs } from "convex/server";

const crons = cronJobs();

// Cron jobs can be added here
// Note: Cron jobs require a minimum interval of 5 minutes

export default crons;
