import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Simple function to create an admin user - NO AUTHENTICATION REQUIRED
export const createAdminUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();

    if (existingUser) {
      // Update existing user to admin
      await ctx.db.patch(existingUser._id, {
        role: "admin",
        updatedAt: now,
      });
      
      return {
        success: true,
        message: "Existing user updated to admin",
        userId: existingUser._id,
        user: existingUser
      };
    } else {
      // Create new admin user
      const newUserId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });

      const newUser = await ctx.db.get(newUserId);
      
      return {
        success: true,
        message: "New admin user created",
        userId: newUserId,
        user: newUser
      };
    }
  },
});

// Get all users (no auth required for debugging)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map(user => ({
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      role: user.role,
      createdAt: new Date(user.createdAt).toISOString(),
    }));
  },
});

// Check if a specific Clerk ID exists in database
export const checkUserExists = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return {
      exists: !!user,
      user: user ? {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        role: user.role,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      } : null
    };
  },
});