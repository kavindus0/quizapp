import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Test function for role assignment (NO AUTH REQUIRED - FOR TESTING ONLY)
export const testRoleAssignment = mutation({
  args: {
    userId: v.id("users"),
    newRole: v.union(
      v.literal("admin"),
      v.literal("employee"),
      v.literal("manager"),
      v.literal("hr"),
      v.literal("security_officer"),
      v.literal("teacher"),
      v.literal("student")
    ),
  },
  handler: async (ctx, args) => {
    // Get the user
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const previousRole = user.role;
    
    // Update the user's role
    await ctx.db.patch(args.userId, {
      role: args.newRole,
      updatedAt: Date.now(),
    });

    // Create audit log entry
    await ctx.db.insert("roleAuditLog", {
      targetUserId: user.clerkId,
      performedBy: "test_system",
      action: "role_assigned",
      previousRole: previousRole,
      newRole: args.newRole,
      reason: "Testing role assignment functionality",
      timestamp: Date.now(),
    });

    return {
      success: true,
      userId: args.userId,
      previousRole: previousRole,
      newRole: args.newRole,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        role: args.newRole,
      }
    };
  },
});

// Test function to view role audit log
export const testViewAuditLog = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let auditLogs;
    
    if (args.userId) {
      auditLogs = await ctx.db
        .query("roleAuditLog")
        .withIndex("by_target_user", (q) => 
          q.eq("targetUserId", args.userId!)
        )
        .order("desc")
        .take(10);
    } else {
      auditLogs = await ctx.db
        .query("roleAuditLog")
        .order("desc")
        .take(10);
    }
    
    return auditLogs.map(log => ({
      id: log._id,
      targetUserId: log.targetUserId,
      performedBy: log.performedBy,
      action: log.action,
      previousRole: log.previousRole,
      newRole: log.newRole,
      reason: log.reason,
      timestamp: new Date(log.timestamp).toISOString(),
    }));
  },
});

// Test function to check if role assignment permissions work
export const testRolePermissions = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Define permissions for each role (simplified test)
    const rolePermissions = {
      admin: ["manage_users", "assign_roles", "manage_system", "create_quiz", "manage_training"],
      employee: ["take_quiz", "view_own_results", "access_training"],
      manager: ["view_team_users", "create_quiz", "manage_training"],
      hr: ["manage_compliance", "view_hr_reports"],
      security_officer: ["manage_security_policies", "view_security_incidents"],
      teacher: ["create_quiz", "manage_training", "view_class_results"],
      student: ["take_quiz", "view_own_results"],
    };

    const userPermissions = rolePermissions[user.role as keyof typeof rolePermissions] || [];

    return {
      userId: user._id,
      userRole: user.role,
      permissions: userPermissions,
      canAssignRoles: userPermissions.includes("assign_roles"),
      canManageUsers: userPermissions.includes("manage_users"),
      canCreateQuiz: userPermissions.includes("create_quiz"),
    };
  },
});