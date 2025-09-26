import { auth, currentUser } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { 
  UserRole, 
  Permission, 
  ROLE_PERMISSIONS, 
  DEFAULT_USER_ROLE,
  hasPermission as checkPermission,
  RCRUser,
  ComplianceRequirements,
  getComplianceRequirements,
  Department,
  DEFAULT_DEPARTMENT
} from "./rcr-rbac";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

/**
 * Get user's role from Clerk metadata (Royal Credit Recoveries specific)
 */
export async function getUserRole(userId?: string): Promise<UserRole> {
  try {
    let user;
    if (userId) {
      user = await clerkClient.users.getUser(userId);
    } else {
      user = await currentUser();
    }
    
    if (!user) {
      return DEFAULT_USER_ROLE;
    }
    
    // Get role from user's public metadata
    const role = user.publicMetadata?.role as UserRole;
    
    // Validate role exists in enum, default to EMPLOYEE
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
 * Check if user has specific permission
 */
export async function hasPermission(permission: Permission, userId?: string): Promise<boolean> {
  try {
    const userRole = await getUserRole(userId);
    return checkPermission(userRole, permission);
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

/**
 * Get user's permissions based on their role
 */
export async function getUserPermissions(userId?: string): Promise<Permission[]> {
  try {
    const userRole = await getUserRole(userId);
    return ROLE_PERMISSIONS[userRole] || [];
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return [];
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId?: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === UserRole.ADMIN;
}

/**
 * Check if user has 2FA enabled
 */
export async function has2FA(userId?: string): Promise<boolean> {
  try {
    let user;
    if (userId) {
      user = await clerkClient.users.getUser(userId);
    } else {
      user = await currentUser();
    }
    
    if (!user) return false;
    
    return user.publicMetadata?.has2FA === true;
  } catch (error) {
    console.error("Error checking 2FA status:", error);
    return false;
  }
}

/**
 * Check if user is compliant with training requirements
 */
export async function isCompliant(userId?: string): Promise<boolean> {
  try {
    let user;
    if (userId) {
      user = await clerkClient.users.getUser(userId);
    } else {
      user = await currentUser();
    }
    
    if (!user) return false;
    
    const role = await getUserRole(userId);
    const requirements = getComplianceRequirements(role);
    
    // Check 2FA requirement
    if (requirements.requires2FA && !await has2FA(userId)) {
      return false;
    }
    
    // Check training completion (this would need to be implemented with actual training data)
    const trainingComplete = user.publicMetadata?.trainingComplete === true;
    const lastTrainingDate = user.publicMetadata?.lastTrainingDate as number;
    
    if (!trainingComplete) return false;
    
    // Check if training is still valid (within refresh period)
    if (lastTrainingDate) {
      const daysSinceTraining = (Date.now() - lastTrainingDate) / (1000 * 60 * 60 * 24);
      if (daysSinceTraining > requirements.refreshPeriod) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error checking compliance:", error);
    return false;
  }
}

/**
 * Require authentication (server-side)
 */
export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  
  const user = await currentUser();
  if (!user) {
    return null;
  }
  
  const role = await getUserRole();
  
  return {
    userId,
    user,
    role
  };
}

/**
 * Require specific permission (server-side)
 */
export async function requirePermission(permission: Permission) {
  const authResult = await requireAuth();
  if (!authResult) {
    return null;
  }
  
  const hasRequiredPermission = await hasPermission(permission);
  if (!hasRequiredPermission) {
    return null;
  }
  
  return authResult;
}

/**
 * Require admin role (server-side)
 */
export async function requireAdmin() {
  const authResult = await requireAuth();
  if (!authResult) {
    return null;
  }
  
  if (!await isAdmin()) {
    return null;
  }
  
  return authResult;
}

/**
 * Require compliance (server-side)
 */
export async function requireCompliance() {
  const authResult = await requireAuth();
  if (!authResult) {
    return null;
  }
  
  if (!await isCompliant()) {
    return null;
  }
  
  return authResult;
}

/**
 * Assign role to user (Admin only)
 */
export async function assignUserRole(targetUserId: string, newRole: UserRole, adminUserId: string): Promise<boolean> {
  try {
    // Check if admin has permission
    if (!await hasPermission(Permission.ASSIGN_ROLES, adminUserId)) {
      throw new Error("Insufficient permissions to assign roles");
    }
    
    // Can't change your own role
    if (targetUserId === adminUserId) {
      throw new Error("Cannot change your own role");
    }
    
    // Update user's role in Clerk metadata
    await clerkClient.users.updateUserMetadata(targetUserId, {
      publicMetadata: {
        role: newRole,
        roleAssignedBy: adminUserId,
        roleAssignedAt: Date.now()
      }
    });
    
    return true;
  } catch (error) {
    console.error("Error assigning user role:", error);
    return false;
  }
}

/**
 * Mark user as training compliant
 */
export async function markTrainingComplete(userId: string, completedTraining: string[]): Promise<boolean> {
  try {
    const user = await clerkClient.users.getUser(userId);
    if (!user) return false;
    
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        trainingComplete: true,
        lastTrainingDate: Date.now(),
        completedTraining: completedTraining
      }
    });
    
    return true;
  } catch (error) {
    console.error("Error marking training complete:", error);
    return false;
  }
}

/**
 * Update user 2FA status
 */
export async function update2FAStatus(userId: string, enabled: boolean): Promise<boolean> {
  try {
    const user = await clerkClient.users.getUser(userId);
    if (!user) return false;
    
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        has2FA: enabled,
        twoFactorEnabledAt: enabled ? Date.now() : null
      }
    });
    
    return true;
  } catch (error) {
    console.error("Error updating 2FA status:", error);
    return false;
  }
}

/**
 * Get all users with roles (Admin only)
 */
export async function getAllUsersWithRoles(): Promise<RCRUser[]> {
  try {
    // Get all users from Clerk
    const { data: users } = await clerkClient.users.getUserList({
      limit: 500, // Adjust as needed for Royal Credit Recoveries size
    });
    
    return users.map(user => ({
      id: user.id,
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      role: (user.publicMetadata?.role as UserRole) || DEFAULT_USER_ROLE,
      department: (user.publicMetadata?.department as Department) || DEFAULT_DEPARTMENT,
      employeeId: user.publicMetadata?.employeeId as string,
      has2FA: user.publicMetadata?.has2FA === true,
      lastTrainingDate: user.publicMetadata?.lastTrainingDate ? new Date(user.publicMetadata.lastTrainingDate as number) : undefined,
      complianceStatus: user.publicMetadata?.complianceStatus as 'compliant' | 'non_compliant' | 'pending' || 'pending',
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    }));
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
}

/**
 * Get user compliance status
 */
export async function getUserComplianceStatus(userId: string): Promise<{
  isCompliant: boolean;
  requirements: ComplianceRequirements;
  completedTraining: string[];
  missingTraining: string[];
  has2FA: boolean;
  lastTrainingDate?: Date;
}> {
  try {
    const user = await clerkClient.users.getUser(userId);
    const role = await getUserRole(userId);
    const requirements = getComplianceRequirements(role);
    const has2FAEnabled = await has2FA(userId);
    const completedTraining = (user?.publicMetadata?.completedTraining as string[]) || [];
    
    const missingTraining = requirements.requiredTraining.filter(
      training => !completedTraining.includes(training)
    );
    
    const isUserCompliant = await isCompliant(userId);
    
    return {
      isCompliant: isUserCompliant,
      requirements,
      completedTraining,
      missingTraining,
      has2FA: has2FAEnabled,
      lastTrainingDate: user?.publicMetadata?.lastTrainingDate ? 
        new Date(user.publicMetadata.lastTrainingDate as number) : undefined
    };
  } catch (error) {
    console.error("Error getting user compliance status:", error);
    return {
      isCompliant: false,
      requirements: getComplianceRequirements(DEFAULT_USER_ROLE),
      completedTraining: [],
      missingTraining: [],
      has2FA: false
    };
  }
}