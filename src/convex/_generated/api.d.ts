/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as chill from "../chill.js";
import type * as connections from "../connections.js";
import type * as events from "../events.js";
import type * as games from "../games.js";
import type * as gossip from "../gossip.js";
import type * as http from "../http.js";
import type * as matching from "../matching.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as posts from "../posts.js";
import type * as profiles from "../profiles.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  chill: typeof chill;
  connections: typeof connections;
  events: typeof events;
  games: typeof games;
  gossip: typeof gossip;
  http: typeof http;
  matching: typeof matching;
  messages: typeof messages;
  notifications: typeof notifications;
  posts: typeof posts;
  profiles: typeof profiles;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
