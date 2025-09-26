import { query } from "./_generated/server";
import { v } from "convex/values";

// Get user role from Convex database by Clerk ID
export const getUserRoleByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return {
      role: user?.role || "employee",
      user: user ? {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      } : null
    };
  },
});

// Get current user's role and info
export const getCurrentUserRole = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { role: "employee", user: null };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    return {
      role: user?.role || "employee",
      user: user ? {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      } : null,
      clerkId: identity.subject
    };
  },
});