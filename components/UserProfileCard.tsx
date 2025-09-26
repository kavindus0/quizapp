"use client";

import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { UserRole } from '@/lib/rbac';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Shield, Calendar, Mail } from 'lucide-react';



const UserProfileCard: React.FC = () => {
    const { userId } = useAuth();
    const { user } = useUser();
    const [userRole, setUserRole] = useState<UserRole>(UserRole.STUDENT);

    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!userId) return;

            try {
                const response = await fetch('/api/auth/check-role', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ allowedRoles: Object.values(UserRole) }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserRole(data.role || UserRole.STUDENT);
                }
            } catch {
                setError('Failed to fetch user role');
            }
        };

        fetchUserRole();
    }, [userId]);

    const getRoleBadgeVariant = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN:
                return 'destructive';
            case UserRole.TEACHER:
                return 'default';
            case UserRole.STUDENT:
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getRoleDescription = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN:
                return 'Full system access and user management';
            case UserRole.TEACHER:
                return 'Can create quizzes and view analytics';
            case UserRole.STUDENT:
                return 'Can take quizzes and view personal results';
            default:
                return 'Basic access';
        }
    };

    const formatDate = (date: Date | number | null) => {
        if (!date) return 'N/A';
        const dateObj = typeof date === 'number' ? new Date(date) : date;
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!user) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-48">
                    <p className="text-gray-500">Loading profile...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Profile
                </CardTitle>
                <CardDescription>
                    Your account information and role permissions
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <Alert>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex items-center gap-4">
                    {user.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={user.imageUrl}
                            alt="Profile"
                            className="w-16 h-16 rounded-full border"
                        />
                    )}
                    <div>
                        <h3 className="text-lg font-semibold">
                            {user.firstName || user.lastName
                                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                : 'No name provided'
                            }
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Shield className="h-4 w-4 text-gray-500" />
                            <Badge variant={getRoleBadgeVariant(userRole)}>
                                {userRole}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm text-gray-600">
                                {user.primaryEmailAddress?.emailAddress}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium">Member since</p>
                            <p className="text-sm text-gray-600">
                                {formatDate(user.createdAt)}
                            </p>
                        </div>
                    </div>

                    {user.lastSignInAt && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium">Last sign in</p>
                                <p className="text-sm text-gray-600">
                                    {formatDate(user.lastSignInAt)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Role Description</h4>
                    <p className="text-sm text-gray-600">
                        {getRoleDescription(userRole)}
                    </p>
                </div>

                <div className="pt-2">
                    <h4 className="text-sm font-medium mb-2">User ID</h4>
                    <p className="text-xs font-mono text-gray-500 break-all">
                        {user.id}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default UserProfileCard;