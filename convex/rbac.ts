import { v } from "convex/values";
import { DatabaseReader, mutation, query } from "./_generated/server";

// Helper function to get current user from Clerk
export async function getCurrentUser(ctx: { auth: any; db: DatabaseReader }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

// Helper function to require specific roles
export async function requireRole(
  ctx: { auth: any; db: DatabaseReader },
  allowedRoles: string[]
) {
  const user = await getCurrentUser(ctx);

  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Access denied. Required roles: ${allowedRoles.join(", ")}`);
  }

  return user;
}

// Helper function to check if user has a specific role
export async function hasRole(
  ctx: { auth: any; db: DatabaseReader },
  role: string
) {
  try {
    const user = await getCurrentUser(ctx);
    return user.role === role;
  } catch {
    return false;
  }
}