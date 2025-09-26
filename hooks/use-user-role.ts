"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

/**
 * Hook to get current user's role for Royal Credit Recoveries
 */
export function useUserRole() {
  const { user } = useUser();
  
  const userRole = useQuery(
    api.userRoles.getUserRoleByClerkId, 
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get role from Clerk metadata as fallback
  const clerkRole = user?.publicMetadata?.role as string;

  return {
    role: userRole?.role || clerkRole || "employee",
    user: userRole?.user,
    isAdmin: (userRole?.role || clerkRole) === "admin",
    isEmployee: (userRole?.role || clerkRole) === "employee",
    isLoading: userRole === undefined && !!user?.id,
    has2FA: Boolean(
      (user?.publicMetadata as any)?.has2FA === true ||
      (user?.unsafeMetadata as any)?.has2FA === true
    ),
    department: (user?.publicMetadata as any)?.department || 'call_center',
    complianceStatus: (user?.publicMetadata as any)?.complianceStatus || 'pending'
  };
}

/**
 * Hook to check if current user is admin
 */
export function useIsAdmin() {
  const { isAdmin, isLoading } = useUserRole();
  return { isAdmin, isLoading };
}

/**
 * Hook to check user permissions for Royal Credit Recoveries
 */
export function usePermissions() {
  const { role, isLoading } = useUserRole();
  
  return {
    isLoading,
    canManageUsers: role === "admin",
    canManagePolicies: role === "admin",
    canManageTraining: role === "admin",
    canViewReports: role === "admin",
    canTakeQuizzes: true, // Both roles can take quizzes
    canViewOwnProgress: true, // Both roles can view their progress
  };
}

/**
 * Hook to check compliance status
 */
export function useComplianceStatus() {
  const { user } = useUser();
  const { role, has2FA } = useUserRole();
  
  const lastTrainingDate = user?.publicMetadata?.lastTrainingDate as number;
  const trainingComplete = user?.publicMetadata?.trainingComplete === true;
  
  const isCompliant = has2FA && trainingComplete && lastTrainingDate && 
    (Date.now() - lastTrainingDate) < (180 * 24 * 60 * 60 * 1000); // 180 days
  
  return {
    isCompliant,
    has2FA,
    trainingComplete,
    lastTrainingDate: lastTrainingDate ? new Date(lastTrainingDate) : null,
    role
  };
}