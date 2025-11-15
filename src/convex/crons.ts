import { cronJobs } from "convex/server";

const crons = cronJobs();

// Cron jobs temporarily disabled due to type instantiation issues
// TODO: Re-enable after Convex type system update

export default crons;
