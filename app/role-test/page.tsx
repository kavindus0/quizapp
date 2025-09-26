"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Settings } from "lucide-react";

export default function RoleTestPage() {
    const { user, isLoaded } = useUser();

    // Get user role from Convex database
    const userRole = useQuery(
        api.userRoles.getUserRoleByClerkId,
        user?.id ? { clerkId: user.id } : "skip"
    );

    // Get all users to see the database state
    const allUsers = useQuery(api.adminSetup.getAllUsers);

    // Function to create admin
    const createAdminUser = useMutation(api.adminSetup.createAdminUser);

    if (!isLoaded) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Please sign in.</div>;
    }

    const isAdmin = userRole?.role === 'admin';
    const userExistsInDB = !!userRole?.user;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 space-y-6">

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Role Status Check
                        </CardTitle>
                        <CardDescription>
                            Check your current role status and fix authentication issues
                        </CardDescription>
                    </CardHeader>
                    <CardContent>

                        {/* Current Status */}
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-semibold text-blue-800">Clerk Auth</h3>
                                <p className="text-2xl">✅</p>
                                <p className="text-sm text-blue-600">Signed in as<br />{user.primaryEmailAddress?.emailAddress}</p>
                            </div>

                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <h3 className="font-semibold text-green-800">Database</h3>
                                <p className="text-2xl">{userExistsInDB ? '✅' : '❌'}</p>
                                <p className="text-sm text-green-600">
                                    {userExistsInDB ? 'User found' : 'User not found'}
                                </p>
                            </div>

                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <h3 className="font-semibold text-red-800">Admin Role</h3>
                                <p className="text-2xl">{isAdmin ? '✅' : '❌'}</p>
                                <p className="text-sm text-red-600">
                                    {isAdmin ? 'Admin access' : 'No admin access'}
                                </p>
                            </div>
                        </div>

                        {/* Status Message */}
                        {!userExistsInDB ? (
                            <Alert className="border-red-200 bg-red-50 mb-4">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800">
                                    <strong>Issue:</strong> Your account exists in Clerk but not in the Convex database.
                                    This is why you're getting permission errors.
                                </AlertDescription>
                            </Alert>
                        ) : !isAdmin ? (
                            <Alert className="border-yellow-200 bg-yellow-50 mb-4">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <AlertDescription className="text-yellow-800">
                                    <strong>Issue:</strong> Your account exists in the database but has 'employee' role instead of 'admin'.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Alert className="border-green-200 bg-green-50 mb-4">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">
                                    <strong>Success:</strong> You have admin access! You should be able to access the admin panel.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* User Details */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <h3 className="font-semibold mb-2">Your Account Details</h3>
                            <div className="space-y-1 text-sm">
                                <p><strong>Clerk ID:</strong> {user.id}</p>
                                <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
                                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                {userRole?.user && (
                                    <p><strong>Database Role:</strong>
                                        <Badge variant={isAdmin ? 'destructive' : 'secondary'} className="ml-2">
                                            {userRole.user.role}
                                        </Badge>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {!isAdmin && (
                                <Button
                                    onClick={async () => {
                                        try {
                                            await createAdminUser({
                                                clerkId: user.id,
                                                email: user.primaryEmailAddress?.emailAddress || "",
                                                firstName: user.firstName || undefined,
                                                lastName: user.lastName || undefined,
                                            });
                                            // Refresh the page to see updated role
                                            window.location.reload();
                                        } catch (error) {
                                            console.error("Failed to create admin:", error);
                                        }
                                    }}
                                    className="w-full"
                                    size="lg"
                                >
                                    🚀 Fix My Admin Access
                                </Button>
                            )}

                            {isAdmin && (
                                <div className="text-center space-y-2">
                                    <p className="text-green-600 font-medium">🎉 Admin access confirmed!</p>
                                    <div className="flex gap-2 justify-center">
                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.href = '/dashboard'}
                                        >
                                            Go to Dashboard
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.href = '/admin'}
                                        >
                                            Admin Panel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Database Debug */}
                        {allUsers && (
                            <details className="mt-6">
                                <summary className="cursor-pointer font-medium">Database Users ({allUsers.length})</summary>
                                <div className="mt-2 space-y-1">
                                    {allUsers.map((dbUser) => (
                                        <div key={dbUser.id} className="flex items-center justify-between text-sm p-2 bg-gray-100 rounded">
                                            <span>{dbUser.email}</span>
                                            <Badge variant={dbUser.role === 'admin' ? 'destructive' : 'secondary'}>
                                                {dbUser.role}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}