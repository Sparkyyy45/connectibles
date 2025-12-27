/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as chill from "../chill.js";
import type * as cleanDatabase from "../cleanDatabase.js";
import type * as connections from "../connections.js";
import type * as crons from "../crons.js";
import type * as events from "../events.js";
import type * as gameStats from "../gameStats.js";
import type * as games from "../games.js";
import type * as gossip from "../gossip.js";
import type * as http from "../http.js";
import type * as matching from "../matching.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as posts from "../posts.js";
import type * as presence from "../presence.js";
import type * as profiles from "../profiles.js";
import type * as repair from "../repair.js";
import type * as reports from "../reports.js";
import type * as truthDare from "../truthDare.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  chill: typeof chill;
  cleanDatabase: typeof cleanDatabase;
  connections: typeof connections;
  crons: typeof crons;
  events: typeof events;
  gameStats: typeof gameStats;
  games: typeof games;
  gossip: typeof gossip;
  http: typeof http;
  matching: typeof matching;
  messages: typeof messages;
  notifications: typeof notifications;
  posts: typeof posts;
  presence: typeof presence;
  profiles: typeof profiles;
  repair: typeof repair;
  reports: typeof reports;
  truthDare: typeof truthDare;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
