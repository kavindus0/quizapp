import { auth, currentUser } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { UserRole, Permission, ROLE_PERMISSIONS, PermissionResult, DEFAULT_USER_ROLE } from "./rbac";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

/**
 * Get user's role from Clerk metadata
 */
export async function getUserRole(userId?: string): Promise<UserRole> {
  try {
    let user;
    
    if (userId) {
      // Get specific user by ID
      user = await clerkClient.users.getUser(userId);
    } else {
      // Get current authenticated user
      user = await currentUser();
    }
    
    if (!user) {
      return DEFAULT_USER_ROLE;
    }
    
    // Get role from user's public metadata
    const role = user.publicMetadata?.role as UserRole;
    
    // Validate role exists in enum, default to STUDENT
    if (Object.values(UserRole).includes(role)) {
      return role;
    }
    
    return DEFAULT_USER_ROLE;
  } catch (error) {
    console.error("Error getting user role:", error);
    return DEFAULT_USER_ROLE;
  }
}

/**
 * Get permissions for a specific role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(
  permission: Permission, 
  userId?: string
): Promise<boolean> {
  try {
    const userRole = await getUserRole(userId);
    const permissions = getRolePermissions(userRole);
    return permissions.includes(permission);
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

/**
 * Check if user has any of the required permissions
 */
export async function hasAnyPermission(
  permissions: Permission[],
  userId?: string
): Promise<boolean> {
  try {
    const userRole = await getUserRole(userId);
    const userPermissions = getRolePermissions(userRole);
    
    return permissions.some(permission => 
      userPermissions.includes(permission)
    );
  } catch (error) {
    console.error("Error checking permissions:", error);
    return false;
  }
}

/**
 * Check if user has all required permissions
 */
export async function hasAllPermissions(
  permissions: Permission[],
  userId?: string
): Promise<boolean> {
  try {
    const userRole = await getUserRole(userId);
    const userPermissions = getRolePermissions(userRole);
    
    return permissions.every(permission => 
      userPermissions.includes(permission)
    );
  } catch (error) {
    console.error("Error checking permissions:", error);
    return false;
  }
}

/**
 * Comprehensive permission check with detailed result
 */
export async function checkPermissions(
  requiredPermissions: Permission[],
  userId?: string
): Promise<PermissionResult> {
  try {
    const userRole = await getUserRole(userId);
    const userPermissions = getRolePermissions(userRole);
    const missingPermissions = requiredPermissions.filter(
      permission => !userPermissions.includes(permission)
    );
    
    return {
      hasPermission: missingPermissions.length === 0,
      role: userRole,
      requiredPermissions,
      userPermissions,
      missingPermissions
    };
  } catch (error) {
    console.error("Error checking permissions:", error);
    return {
      hasPermission: false,
      role: DEFAULT_USER_ROLE,
      requiredPermissions,
      userPermissions: [],
      missingPermissions: requiredPermissions
    };
  }
}

/**
 * Assign role to user (Admin only)
 */
export async function assignUserRole(
  targetUserId: string,
  newRole: UserRole,
  adminUserId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if the assigner has admin permissions
    if (adminUserId) {
      const hasAdminPermission = await hasPermission(
        Permission.ASSIGN_ROLES,
        adminUserId
      );
      
      if (!hasAdminPermission) {
        return {
          success: false,
          error: "Insufficient permissions to assign roles"
        };
      }
    }
    
    // Update user's role in Clerk metadata
    await clerkClient.users.updateUserMetadata(targetUserId, {
      publicMetadata: {
        role: newRole,
        roleAssignedAt: new Date().toISOString(),
        roleAssignedBy: adminUserId || "system"
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error assigning role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign role"
    };
  }
}

/**
 * Remove role from user (set to default)
 */
export async function removeUserRole(
  targetUserId: string,
  adminUserId?: string
): Promise<{ success: boolean; error?: string }> {
  return assignUserRole(targetUserId, DEFAULT_USER_ROLE, adminUserId);
}

/**
 * Get all users with their roles (Admin only)
 */
export async function getAllUsersWithRoles(adminUserId?: string): Promise<{
  success: boolean;
  users?: Array<{
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    roleAssignedAt?: string;
    createdAt: number;
  }>;
  error?: string;
}> {
  try {
    // Check admin permissions
    if (adminUserId) {
      const hasAdminPermission = await hasPermission(
        Permission.VIEW_ALL_USERS,
        adminUserId
      );
      
      if (!hasAdminPermission) {
        return {
          success: false,
          error: "Insufficient permissions to view all users"
        };
      }
    }
    
    // Get all users from Clerk
    const { data: users } = await clerkClient.users.getUserList({
      limit: 500 // Adjust as needed
    });
    
    const usersWithRoles = users.map((user) => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      role: (user.publicMetadata?.role as UserRole) || DEFAULT_USER_ROLE,
      roleAssignedAt: user.publicMetadata?.roleAssignedAt as string,
      createdAt: user.createdAt
    }));
    
    return { success: true, users: usersWithRoles };
  } catch (error) {
    console.error("Error getting users with roles:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get users"
    };
  }
}

/**
 * Server-side authentication and authorization guard
 */
export async function requireAuth(): Promise<{
  userId: string;
  role: UserRole;
} | null> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }
    
    const role = await getUserRole(userId);
    
    return { userId, role };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

/**
 * Server-side permission guard
 */
export async function requirePermission(
  permission: Permission
): Promise<{
  userId: string;
  role: UserRole;
} | null> {
  try {
    const authResult = await requireAuth();
    
    if (!authResult) {
      return null;
    }
    
    const hasRequiredPermission = await hasPermission(permission, authResult.userId);
    
    if (!hasRequiredPermission) {
      return null;
    }
    
    return authResult;
  } catch (error) {
    console.error("Permission check error:", error);
    return null;
  }
}

/**
 * Server-side role guard
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<{
  userId: string;
  role: UserRole;
} | null> {
  try {
    const authResult = await requireAuth();
    
    if (!authResult) {
      return null;
    }
    
    if (!allowedRoles.includes(authResult.role)) {
      return null;
    }
    
    return authResult;
  } catch (error) {
    console.error("Role check error:", error);
    return null;
  }
}