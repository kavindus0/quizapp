"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Crown, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function SetupAdminPage() {
    const { user, isLoaded } = useUser();
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const syncUserFromClerk = useMutation(api.users.syncUserFromClerk);
    const createFirstAdmin = useMutation(api.users.createFirstAdmin);

    const handleMakeAdmin = async () => {
        try {
            setStatus("loading");
            setMessage("");

            if (!user?.id || !user?.primaryEmailAddress?.emailAddress) {
                throw new Error("User information is missing. Please make sure you're signed in.");
            }

            // Try syncing first with forceAdmin flag
            try {
                const syncResult = await syncUserFromClerk({
                    clerkId: user.id,
                    email: user.primaryEmailAddress.emailAddress,
                    firstName: user.firstName || undefined,
                    lastName: user.lastName || undefined,
                    forceAdmin: true,
                });

                setStatus("success");
                setMessage(`Successfully granted admin access! (${syncResult.action})`);
            } catch (syncError) {
                // Fallback to emergency method
                const result = await createFirstAdmin({
                    clerkId: user.id,
                    email: user.primaryEmailAddress.emailAddress,
                    firstName: user.firstName || undefined,
                    lastName: user.lastName || undefined,
                });

                setStatus("success");
                setMessage(result.message || "Successfully granted admin access! You can now access admin features.");
            }
        } catch (error: any) {
            setStatus("error");
            setMessage(error.message || "Failed to grant admin access");
        }
    };

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">Authentication Required</CardTitle>
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
            <div className="max-w-2xl mx-auto px-4">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Crown className="w-6 h-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl">Admin Setup</CardTitle>
                        <CardDescription>
                            Grant admin access to your account to manage the SecureAware platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* User Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Current User</h3>
                            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                            <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
                            <p><strong>Clerk ID:</strong> {user.id}</p>
                            <p><strong>Status:</strong> {user ? "✅ Signed in" : "❌ Not signed in"}</p>
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
                        <div className="space-y-4">
                            <Button
                                onClick={handleMakeAdmin}
                                disabled={status === "loading" || status === "success"}
                                className="w-full"
                                size="lg"
                            >
                                {status === "loading" ? "Setting up..." :
                                    status === "success" ? "Admin Access Granted ✓" :
                                        "Grant Admin Access"}
                            </Button>

                            {status === "success" && (
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-gray-600">
                                        You now have admin access! You can:
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                        <Link href="/dashboard">
                                            <Button variant="outline" size="sm">
                                                Go to Dashboard
                                            </Button>
                                        </Link>
                                        <Link href="/admin">
                                            <Button variant="outline" size="sm">
                                                Access Admin Panel
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Alternative Method */}
                        {status === "error" && (
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                <h4 className="font-semibold text-blue-800 mb-2">🔧 Alternative Method</h4>
                                <p className="text-sm text-blue-700 mb-2">
                                    If the automatic method fails, you can manually set up admin access:
                                </p>
                                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                                    <li>Go to your Convex Dashboard</li>
                                    <li>Navigate to Functions tab</li>
                                    <li>Call <code>users.createFirstAdmin</code> with these parameters:</li>
                                </ol>
                                <div className="mt-2 p-2 bg-white rounded border font-mono text-xs">
                                    clerkId: "{user.id}"<br />
                                    email: "{user.primaryEmailAddress?.emailAddress}"<br />
                                    firstName: "{user.firstName || ''}"<br />
                                    lastName: "{user.lastName || ''}"
                                </div>
                            </div>
                        )}

                        {/* Warning */}
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• This is a one-time setup function for initial admin access</li>
                                <li>• Once you have admin access, you can manage other users through the admin panel</li>
                                <li>• This setup page can be removed after initial configuration</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}