"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Shield, User, Database } from "lucide-react";

export default function DirectAdminSetupPage() {
    const { user, isLoaded } = useUser();
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const createAdminUser = useMutation(api.adminSetup.createAdminUser);
    const allUsers = useQuery(api.adminSetup.getAllUsers);
    const userExists = useQuery(
        api.adminSetup.checkUserExists,
        user ? { clerkId: user.id } : "skip"
    );

    const handleCreateAdmin = async () => {
        if (!user) return;

        try {
            setStatus("loading");
            setMessage("");

            const result = await createAdminUser({
                clerkId: user.id,
                email: user.primaryEmailAddress?.emailAddress || "",
                firstName: user.firstName || undefined,
                lastName: user.lastName || undefined,
            });

            setStatus("success");
            setMessage(result.message);
        } catch (error: any) {
            setStatus("error");
            setMessage(error.message || "Failed to create admin user");
        }
    };

    if (!isLoaded) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">Sign In Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-gray-600">
                            Please sign in to set up admin access.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 space-y-6">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <Shield className="w-6 h-6 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl">Direct Admin Setup</CardTitle>
                        <CardDescription>
                            Simple, direct admin access setup (no authentication issues)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Current Status */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                                <User className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                                <p className="text-sm font-medium text-blue-600">Clerk Status</p>
                                <p className="text-lg font-bold">✅ Signed In</p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg text-center">
                                <Database className="w-6 h-6 mx-auto mb-2 text-green-600" />
                                <p className="text-sm font-medium text-green-600">Database Status</p>
                                <p className="text-lg font-bold">
                                    {userExists?.exists ? "✅ Found" : "❌ Missing"}
                                </p>
                            </div>

                            <div className="bg-red-50 p-4 rounded-lg text-center">
                                <Shield className="w-6 h-6 mx-auto mb-2 text-red-600" />
                                <p className="text-sm font-medium text-red-600">Admin Status</p>
                                <p className="text-lg font-bold">
                                    {userExists?.user?.role === 'admin' ? "✅ Admin" : "❌ No Admin"}
                                </p>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Your Account Details</h3>
                            <div className="space-y-1 text-sm">
                                <p><strong>Clerk ID:</strong> {user.id}</p>
                                <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
                                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                            </div>

                            {userExists?.user && (
                                <div className="mt-3 pt-3 border-t">
                                    <h4 className="font-medium text-green-700">Database Record Found:</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={userExists.user.role === 'admin' ? 'destructive' : 'secondary'}>
                                            {userExists.user.role}
                                        </Badge>
                                        <span className="text-sm text-gray-600">
                                            {userExists.user.name || userExists.user.email}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status Messages */}
                        {status === "success" && (
                            <Alert className="border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">
                                    {message}
                                </AlertDescription>
                            </Alert>
                        )}

                        {status === "error" && (
                            <Alert className="border-red-200 bg-red-50">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800">
                                    {message}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Action Button */}
                        <Button
                            onClick={handleCreateAdmin}
                            disabled={status === "loading" || userExists?.user?.role === 'admin'}
                            className="w-full"
                            size="lg"
                        >
                            {status === "loading" ? "Creating Admin..." :
                                userExists?.user?.role === 'admin' ? "✅ Already Admin" :
                                    userExists?.exists ? "Upgrade to Admin" :
                                        "Create Admin Account"}
                        </Button>

                        {/* Success Actions */}
                        {(status === "success" || userExists?.user?.role === 'admin') && (
                            <div className="text-center space-y-3">
                                <p className="text-sm text-green-600 font-medium">
                                    🎉 You now have admin access!
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
                                        Go to Dashboard
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin'}>
                                        Admin Panel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* All Users Debug */}
                        {allUsers && allUsers.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">All Database Users ({allUsers.length})</h3>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {allUsers.map((dbUser) => (
                                        <div key={dbUser.id} className="flex items-center justify-between text-sm">
                                            <span>{dbUser.email}</span>
                                            <Badge variant={dbUser.role === 'admin' ? 'destructive' : 'secondary'}>
                                                {dbUser.role}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}