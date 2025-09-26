"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Users, CheckCircle, AlertCircle } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function TestAdminPage() {
    const { user, isLoaded } = useUser();
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");

    // Convex queries and mutations
    const currentUser = useQuery(api.users.getCurrentUser);
    const allUsers = useQuery(api.users.listUsers);
    const makeAdmin = useMutation(api.users.makeCurrentUserAdmin);
    const updateRole = useMutation(api.users.updateUserRole);

    const handleMakeAdmin = async () => {
        try {
            setError("");
            setMessage("");
            await makeAdmin();
            setMessage("Successfully made current user an admin!");
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
            setMessage("");

            await updateRole({
                userId: selectedUserId as Id<"users">,
                newRole: selectedRole as any
            });

            setMessage(`Successfully updated user role to ${selectedRole}!`);
            setSelectedRole("");
            setSelectedUserId("");
        } catch (err) {
            setError(`Error updating role: ${err}`);
        }
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin':
                return 'destructive';
            case 'manager':
            case 'teacher':
                return 'default';
            case 'employee':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
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
                        <CardDescription>Please sign in to test admin functionality</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>You need to be signed in to test the user management system.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Admin User Management Test</h1>
                    </div>
                    <p className="text-gray-600">
                        Test user management functionality using Convex directly
                    </p>
                </div>

                {/* Current User Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current User Information</CardTitle>
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
                                        <p><strong>Role:</strong> <Badge variant={getRoleBadgeVariant(currentUser.role)}>{currentUser.role}</Badge></p>
                                        <p><strong>Created:</strong> {new Date(currentUser.createdAt).toLocaleDateString()}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Messages */}
                {error && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                )}

                {message && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{message}</AlertDescription>
                    </Alert>
                )}

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

                    {/* Update User Role */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Update User Role</CardTitle>
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
                                disabled={!selectedUserId || !selectedRole}
                            >
                                Update Role
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* All Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            All Users in System
                        </CardTitle>
                        <CardDescription>
                            List of all users and their current roles
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {allUsers && allUsers.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Updated</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allUsers.map((user) => (
                                            <TableRow key={user._id}>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    {user.firstName && user.lastName
                                                        ? `${user.firstName} ${user.lastName}`
                                                        : 'No name'
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getRoleBadgeVariant(user.role)}>
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-500">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-500">
                                                    {new Date(user.updatedAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No users found or you don't have permission to view them.</p>
                                <p className="text-sm">Try making yourself an admin first.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Debug Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Debug Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <p><strong>User loaded:</strong> {isLoaded ? "Yes" : "No"}</p>
                            <p><strong>User authenticated:</strong> {user ? "Yes" : "No"}</p>
                            <p><strong>Current user query:</strong> {currentUser ? "Success" : "No data"}</p>
                            <p><strong>All users query:</strong> {allUsers ? `${allUsers.length} users` : "No data"}</p>
                            <p><strong>Current user role:</strong> {currentUser?.role || "Unknown"}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}