"use client";

import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserRole, Permission } from '@/lib/rbac';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Settings, AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import { Id } from "@/convex/_generated/dataModel";

export const dynamic = 'force-dynamic';

interface RoleInfo {
    role: UserRole;
    permissions: Permission[];
}

const AdminDashboard: React.FC = () => {
    const { userId } = useAuth();
    const { user, isLoaded } = useUser();
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [updatingRole, setUpdatingRole] = useState<string>('');

    // Convex queries and mutations
    const currentUser = useQuery(api.users.getCurrentUser);
    const allUsers = useQuery(api.users.listUsers);
    const makeAdmin = useMutation(api.users.makeCurrentUserAdmin);
    const updateRole = useMutation(api.users.updateUserRole);

    // Static roles data
    const roles: RoleInfo[] = [
        { role: UserRole.ADMIN, permissions: [Permission.MANAGE_USERS, Permission.ASSIGN_ROLES, Permission.VIEW_ALL_USERS] },
        { role: UserRole.TEACHER, permissions: [Permission.VIEW_ALL_USERS] },
        { role: UserRole.STUDENT, permissions: [] }
    ];

    // Admin functions
    const handleMakeAdmin = async () => {
        try {
            setError("");
            setSuccess("");
            await makeAdmin();
            setSuccess("Successfully made current user an admin!");
        } catch (err) {
            setError(`Error making admin: ${err}`);
        }
    };

    const handleUpdateRole = async () => {
        if (!selectedUserId || !selectedRole) {
            setError("Please select both a user and a role");
            return;
        }

        try {
            setError("");
            setSuccess("");
            setUpdatingRole(selectedUserId);

            await updateRole({
                userId: selectedUserId as Id<"users">,
                newRole: selectedRole as any,
                reason: "Updated via admin dashboard"
            });

            setSuccess(`Successfully updated user role to ${selectedRole}!`);
            setSelectedRole("");
            setSelectedUserId("");
        } catch (err) {
            setError(`Error updating role: ${err}`);
        } finally {
            setUpdatingRole('');
        }
    };

    // Get role badge color - updated for both UserRole enum and string values
    const getRoleBadgeVariant = (role: UserRole | string) => {
        const roleStr = typeof role === 'string' ? role : role;
        switch (roleStr) {
            case 'admin':
            case UserRole.ADMIN:
                return 'destructive' as const;
            case 'teacher':
            case UserRole.TEACHER:
            case 'manager':
                return 'default' as const;
            case 'employee':
            case UserRole.STUDENT:
                return 'secondary' as const;
            default:
                return 'outline' as const;
        }
    };

    // Format date
    const formatDate = (timestamp: number | string) => {
        const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-96">
                    <CardHeader>
                        <CardTitle>Authentication Required</CardTitle>
                        <CardDescription>Please sign in to access admin functionality</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>You need to be signed in to access the admin dashboard.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    </div>
                    <p className="text-gray-600">
                        Manage users, roles, and permissions for SecureAware
                    </p>
                </div>

                {/* Alerts */}
                {error && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="mb-6 border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                )}

                {/* Main Content */}
                <Tabs defaultValue="setup" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="setup" className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Admin Setup
                        </TabsTrigger>
                        <TabsTrigger value="users" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            User Management
                        </TabsTrigger>
                        <TabsTrigger value="roles" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Roles & Permissions
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    {/* Admin Setup Tab */}
                    <TabsContent value="setup">
                        <div className="space-y-6">
                            {/* Current User Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Current User Information</CardTitle>
                                    <CardDescription>Your account details and current permissions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p><strong>Clerk ID:</strong> {user.id}</p>
                                            <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
                                            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                        </div>
                                        <div>
                                            <p><strong>Convex User:</strong> {currentUser ? "Found" : "Not Found"}</p>
                                            {currentUser && (
                                                <>
                                                    <p><strong>Role:</strong> <Badge variant={getRoleBadgeVariant(currentUser.role as UserRole)}>{currentUser.role}</Badge></p>
                                                    <p><strong>Created:</strong> {new Date(currentUser.createdAt).toLocaleDateString()}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Admin Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Make Admin */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Make Current User Admin</CardTitle>
                                        <CardDescription>
                                            Grant admin privileges to the current user
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            onClick={handleMakeAdmin}
                                            className="w-full"
                                            disabled={currentUser?.role === 'admin'}
                                        >
                                            {currentUser?.role === 'admin' ? 'Already Admin' : 'Make Me Admin'}
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Quick Role Update */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Role Update</CardTitle>
                                        <CardDescription>
                                            Change another user's role (requires admin)
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Select User:</label>
                                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose a user" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {allUsers?.map((user) => (
                                                        <SelectItem key={user._id} value={user._id}>
                                                            {user.email} ({user.role})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">New Role:</label>
                                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose a role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="manager">Manager</SelectItem>
                                                    <SelectItem value="teacher">Teacher</SelectItem>
                                                    <SelectItem value="employee">Employee</SelectItem>
                                                    <SelectItem value="hr">HR</SelectItem>
                                                    <SelectItem value="security_officer">Security Officer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button
                                            onClick={handleUpdateRole}
                                            className="w-full"
                                            disabled={!selectedUserId || !selectedRole || updatingRole === selectedUserId}
                                        >
                                            {updatingRole === selectedUserId ? 'Updating...' : 'Update Role'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Management</CardTitle>
                                <CardDescription>
                                    View and manage user roles and permissions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Current Role</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead>Role Assigned</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allUsers && allUsers.length > 0 ? allUsers.map((dbUser) => (
                                                <TableRow key={dbUser._id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">
                                                                {dbUser.firstName && dbUser.lastName
                                                                    ? `${dbUser.firstName} ${dbUser.lastName}`
                                                                    : 'No name provided'
                                                                }
                                                            </p>
                                                            <p className="text-sm text-gray-500">ID: {dbUser._id.slice(-10)}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{dbUser.email}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getRoleBadgeVariant(dbUser.role as UserRole)}>
                                                            {dbUser.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-500">
                                                        {formatDate(dbUser.createdAt)}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-500">
                                                        {formatDate(dbUser.updatedAt)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {dbUser.clerkId !== userId && (
                                                            <Select
                                                                value={dbUser.role}
                                                                onValueChange={async (newRole: string) => {
                                                                    try {
                                                                        setUpdatingRole(dbUser._id);
                                                                        await updateRole({
                                                                            userId: dbUser._id,
                                                                            newRole: newRole as any,
                                                                            reason: "Updated via admin dashboard"
                                                                        });
                                                                        setSuccess(`Updated ${dbUser.email} role to ${newRole}`);
                                                                    } catch (err) {
                                                                        setError(`Failed to update role: ${err}`);
                                                                    } finally {
                                                                        setUpdatingRole('');
                                                                    }
                                                                }}
                                                                disabled={updatingRole === dbUser._id}
                                                            >
                                                                <SelectTrigger className="w-32">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="admin">Admin</SelectItem>
                                                                    <SelectItem value="teacher">Teacher</SelectItem>
                                                                    <SelectItem value="employee">Employee</SelectItem>
                                                                    <SelectItem value="manager">Manager</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                        {dbUser.clerkId === userId && (
                                                            <Badge variant="outline">Current User</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                        {allUsers === undefined ? "Loading users..." : "No users found"}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Roles Tab */}
                    <TabsContent value="roles">
                        <div className="grid gap-6 md:grid-cols-3">
                            {roles.map((roleInfo) => (
                                <Card key={roleInfo.role}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Badge variant={getRoleBadgeVariant(roleInfo.role)}>
                                                {roleInfo.role}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>
                                            Permissions for {roleInfo.role.toLowerCase()} users
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {roleInfo.permissions.length > 0 ? (
                                                roleInfo.permissions.map((permission) => (
                                                    <div key={permission} className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        <span className="text-sm">{permission.replace(/_/g, ' ')}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500">No special permissions</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Settings</CardTitle>
                                <CardDescription>
                                    Configure RBAC settings and system behavior
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Default Role</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            New users are automatically assigned the STUDENT role by default.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Role Hierarchy</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="destructive">ADMIN</Badge>
                                                <span className="text-sm">Full system access and user management</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="default">TEACHER</Badge>
                                                <span className="text-sm">Can create and manage quizzes, view analytics</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">STUDENT</Badge>
                                                <span className="text-sm">Can take quizzes and view own results</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Statistics</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {allUsers?.filter(u => u.role === 'admin').length || 0}
                                                </div>
                                                <div className="text-sm text-gray-600">Admins</div>
                                            </div>
                                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {allUsers?.filter(u => u.role === 'teacher').length || 0}
                                                </div>
                                                <div className="text-sm text-gray-600">Teachers</div>
                                            </div>
                                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {allUsers?.filter(u => u.role === 'employee').length || 0}
                                                </div>
                                                <div className="text-sm text-gray-600">Employees</div>
                                            </div>
                                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                <div className="text-2xl font-bold text-gray-600">
                                                    {allUsers?.length || 0}
                                                </div>
                                                <div className="text-sm text-gray-600">Total Users</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminDashboard;