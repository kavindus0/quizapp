import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./rbac";

// Get current authenticated user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

// Get all users (Admin only)
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);

    return await ctx.db.query("users").collect();
  },
});

// Get a specific user (Admin only)
export const getUser = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);

    return await ctx.db.get(args.id);
  },
});

// Update user role (Admin only)
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    newRole: v.union(
      v.literal("admin"), 
      v.literal("manager"), 
      v.literal("hr"), 
      v.literal("security_officer"), 
      v.literal("employee"),
      v.literal("teacher"),
      v.literal("student")
    ),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user has admin role
    const adminUser = await requireRole(ctx, ["admin"]);

    // Get the target user
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    const previousRole = targetUser.role;
    
    // Update the user's role
    await ctx.db.patch(args.userId, {
      role: args.newRole,
      updatedAt: Date.now(),
    });

    // Log the role change in the audit log
    await ctx.db.insert("roleAuditLog", {
      targetUserId: targetUser.clerkId,
      performedBy: adminUser.clerkId,
      action: "role_changed",
      previousRole,
      newRole: args.newRole,
      reason: args.reason || "No reason provided",
      timestamp: Date.now(),
    });

    return {
      success: true,
      message: `User role updated from ${previousRole} to ${args.newRole}`,
    };
  },
});

// Create a new user (typically called when someone signs up)
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("employee"))),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      return existingUser;
    }

    // Create new user with default role as employee
    const now = Date.now();
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      role: args.role || "employee",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get role audit log (Admin only)
export const getRoleAuditLog = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);

    if (args.userId) {
      return await ctx.db
        .query("roleAuditLog")
        .withIndex("by_target_user", (q) => q.eq("targetUserId", args.userId!))
        .order("desc")
        .take(100);
    } else {
      return await ctx.db
        .query("roleAuditLog")
        .order("desc")
        .take(100);
    }
  },
});

// Make user admin by Clerk ID (temporary function for initial setup)
export const makeUserAdminByClerkId = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      // If user doesn't exist, create them as admin
      const now = Date.now();
      return await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
    } else {
      // Update existing user to admin
      await ctx.db.patch(user._id, {
        role: "admin",
        updatedAt: Date.now(),
      });
      return user._id;
    }
  },
});

// Sync user from Clerk to Convex database
export const syncUserFromClerk = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    forceAdmin: v.optional(v.boolean()), // For initial setup
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();

    if (existingUser) {
      // Update existing user info
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        updatedAt: now,
        // Only update role if forceAdmin is true and no admins exist
        ...(args.forceAdmin && {
          role: "admin"
        })
      });
      
      return {
        success: true,
        user: existingUser,
        action: "updated"
      };
    } else {
      // Check if this should be the first admin
      const existingAdmins = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("role"), "admin"))
        .collect();

      const shouldBeAdmin = args.forceAdmin || existingAdmins.length === 0;

      // Create new user
      const newUserId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        role: shouldBeAdmin ? "admin" : "employee",
        createdAt: now,
        updatedAt: now,
      });

      const newUser = await ctx.db.get(newUserId);
      
      return {
        success: true,
        user: newUser,
        action: shouldBeAdmin ? "created_as_admin" : "created_as_employee"
      };
    }
  },
});

// EMERGENCY: Create first admin without authentication (REMOVE AFTER USE)
export const createFirstAdmin = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if any admin already exists
    const existingAdmins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();

    if (existingAdmins.length > 0) {
      throw new Error("Admin users already exist. This function is only for initial setup.");
    }

    // Find the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      // If user doesn't exist, create them as admin
      const now = Date.now();
      const newUser = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
      
      return {
        success: true,
        message: "First admin user created successfully!",
        userId: newUser
      };
    } else {
      // Update existing user to admin
      await ctx.db.patch(user._id, {
        role: "admin",
        updatedAt: Date.now(),
      });
      
      return {
        success: true,
        message: "User updated to admin successfully!",
        userId: user._id
      };
    }
  },
});

// Make current user admin (temporary function for initial setup)
export const makeCurrentUserAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated - make sure you are signed in to Clerk");
    }

    // Find the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      // If user doesn't exist, create them as admin
      const now = Date.now();
      return await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: identity.email || "",
        firstName: identity.givenName,
        lastName: identity.familyName,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
    } else {
      // Update existing user to admin
      await ctx.db.patch(user._id, {
        role: "admin",
        updatedAt: Date.now(),
      });
      return user._id;
    }
  },
});