"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { UserRole, Permission } from '@/lib/rbac';

interface PermissionGuardProps {
    permission: Permission;
    children: ReactNode;
    fallback?: ReactNode;
    userId?: string;
}

interface RoleGuardProps {
    allowedRoles: UserRole[];
    children: ReactNode;
    fallback?: ReactNode;
    userId?: string;
}

interface UserInfo {
    hasPermission: boolean;
    role: UserRole;
    loading: boolean;
    error?: string;
}

// Hook to check user permissions
export const usePermission = (permission: Permission): UserInfo => {
    const { userId, isLoaded } = useAuth();
    const [userInfo, setUserInfo] = useState<UserInfo>({
        hasPermission: false,
        role: UserRole.STUDENT,
        loading: true
    });

    useEffect(() => {
        const checkPermission = async () => {
            if (!isLoaded) return;

            if (!userId) {
                setUserInfo({
                    hasPermission: false,
                    role: UserRole.STUDENT,
                    loading: false,
                    error: 'Not authenticated'
                });
                return;
            }

            try {
                const response = await fetch(`/api/auth/check-permission`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ permission }),
                });

                if (!response.ok) {
                    throw new Error('Failed to check permission');
                }

                const data = await response.json();
                setUserInfo({
                    hasPermission: data.hasPermission,
                    role: data.role,
                    loading: false
                });

            } catch (error) {
                setUserInfo({
                    hasPermission: false,
                    role: UserRole.STUDENT,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Permission check failed'
                });
            }
        };

        checkPermission();
    }, [permission, userId, isLoaded]);

    return userInfo;
};

// Hook to check user role
export const useRole = (allowedRoles: UserRole[]): UserInfo => {
    const { userId, isLoaded } = useAuth();
    const [userInfo, setUserInfo] = useState<UserInfo>({
        hasPermission: false,
        role: UserRole.STUDENT,
        loading: true
    });

    useEffect(() => {
        const checkRole = async () => {
            if (!isLoaded) return;

            if (!userId) {
                setUserInfo({
                    hasPermission: false,
                    role: UserRole.STUDENT,
                    loading: false,
                    error: 'Not authenticated'
                });
                return;
            }

            try {
                const response = await fetch(`/api/auth/check-role`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ allowedRoles }),
                });

                if (!response.ok) {
                    throw new Error('Failed to check role');
                }

                const data = await response.json();
                setUserInfo({
                    hasPermission: data.hasAccess,
                    role: data.role,
                    loading: false
                });

            } catch (error) {
                setUserInfo({
                    hasPermission: false,
                    role: UserRole.STUDENT,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Role check failed'
                });
            }
        };

        checkRole();
    }, [allowedRoles, userId, isLoaded]);

    return userInfo;
};

// Component to guard content based on permissions
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    children,
    fallback = null,
}) => {
    const { hasPermission, loading, error } = usePermission(permission);

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        );
    }

    if (error || !hasPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

// Component to guard content based on roles
export const RoleGuard: React.FC<RoleGuardProps> = ({
    allowedRoles,
    children,
    fallback = null,
}) => {
    const { hasPermission, loading, error } = useRole(allowedRoles);

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        );
    }

    if (error || !hasPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

// Admin-only content guard
export const AdminOnly: React.FC<{
    children: ReactNode;
    fallback?: ReactNode;
}> = ({ children, fallback = null }) => (
    <RoleGuard allowedRoles={[UserRole.ADMIN]} fallback={fallback}>
        {children}
    </RoleGuard>
);

// Teacher+ (Teacher or Admin) content guard
export const TeacherOnly: React.FC<{
    children: ReactNode;
    fallback?: ReactNode;
}> = ({ children, fallback = null }) => (
    <RoleGuard
        allowedRoles={[UserRole.ADMIN, UserRole.TEACHER]}
        fallback={fallback}
    >
        {children}
    </RoleGuard>
);

// Student+ (any authenticated user) content guard
export const StudentOnly: React.FC<{
    children: ReactNode;
    fallback?: ReactNode;
}> = ({ children, fallback = null }) => (
    <RoleGuard
        allowedRoles={[UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]}
        fallback={fallback}
    >
        {children}
    </RoleGuard>
);

const RBACComponents = {
    PermissionGuard,
    RoleGuard,
    AdminOnly,
    TeacherOnly,
    StudentOnly,
    usePermission,
    useRole
};

export default RBACComponents;