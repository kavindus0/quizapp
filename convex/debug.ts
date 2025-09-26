import { query } from "./_generated/server";

// Debug function to see all users and their roles
export const debugUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return {
      totalUsers: users.length,
      users: users.map(user => ({
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        role: user.role,
        createdAt: new Date(user.createdAt).toISOString(),
      }))
    };
  },
});

// Debug function to see role audit log
export const debugRoleAudit = query({
  args: {},
  handler: async (ctx) => {
    const auditLogs = await ctx.db.query("roleAuditLog").order("desc").take(10);
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