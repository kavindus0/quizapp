/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as adminSetup from "../adminSetup.js";
import type * as certifications from "../certifications.js";
import type * as debug from "../debug.js";
import type * as faq from "../faq.js";
import type * as moduleQuizLink from "../moduleQuizLink.js";
import type * as mutations from "../mutations.js";
import type * as policies from "../policies.js";
import type * as progress from "../progress.js";
import type * as queries from "../queries.js";
import type * as quickUpdate from "../quickUpdate.js";
import type * as quizzes from "../quizzes.js";
import type * as rbac from "../rbac.js";
import type * as realtimeProgress from "../realtimeProgress.js";
import type * as reports from "../reports.js";
import type * as simulations from "../simulations.js";
import type * as testRoles from "../testRoles.js";
import type * as training from "../training.js";
import type * as userRoles from "../userRoles.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  adminSetup: typeof adminSetup;
  certifications: typeof certifications;
  debug: typeof debug;
  faq: typeof faq;
  moduleQuizLink: typeof moduleQuizLink;
  mutations: typeof mutations;
  policies: typeof policies;
  progress: typeof progress;
  queries: typeof queries;
  quickUpdate: typeof quickUpdate;
  quizzes: typeof quizzes;
  rbac: typeof rbac;
  realtimeProgress: typeof realtimeProgress;
  reports: typeof reports;
  simulations: typeof simulations;
  testRoles: typeof testRoles;
  training: typeof training;
  userRoles: typeof userRoles;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
