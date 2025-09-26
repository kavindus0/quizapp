"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, RefreshCw, Database, User } from "lucide-react";

export default function SyncDebugPage() {
    const { user, isLoaded } = useUser();
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const syncUserFromClerk = useMutation(api.users.syncUserFromClerk);
    const debugUsers = useQuery(api.debug.debugUsers);

    const handleSync = async () => {
        if (!user) return;

        try {
            setStatus("loading");
            setMessage("");

            const result = await syncUserFromClerk({
                clerkId: user.id,
                email: user.primaryEmailAddress?.emailAddress || "",
                firstName: user.firstName || undefined,
                lastName: user.lastName || undefined,
                forceAdmin: true,
            });

            setStatus("success");
            setMessage(`Sync successful: ${result.action}`);
        } catch (error: any) {
            setStatus("error");
            setMessage(error.message || "Sync failed");
        }
    };

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>Please sign in to access sync debug page.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5" />
                            User Sync Debug
                        </CardTitle>
                        <CardDescription>
                            Debug and manually sync Clerk users with Convex database
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Clerk User Info */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Clerk User Info
                                </h3>
                                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                                    <p><strong>ID:</strong> {user.id}</p>
                                    <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
                                    <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                    <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Database className="w-4 h-4" />
                                    Convex Database
                                </h3>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    {debugUsers ? (
                                        <div className="space-y-2">
                                            <p><strong>Total Users:</strong> {debugUsers.totalUsers}</p>
                                            <div className="max-h-40 overflow-y-auto">
                                                {debugUsers.users.map((dbUser) => (
                                                    <div key={dbUser.id} className="border-b pb-2 mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm">{dbUser.email}</span>
                                                            <Badge variant={dbUser.role === 'admin' ? 'destructive' : 'secondary'}>
                                                                {dbUser.role}
                                                            </Badge>
                                                        </div>
                                                        {dbUser.clerkId === user.id && (
                                                            <Badge variant="outline" className="text-xs">Your Account</Badge>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p>Loading database info...</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sync Status */}
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

                        {/* Sync Actions */}
                        <div className="space-y-4">
                            <Button
                                onClick={handleSync}
                                disabled={status === "loading"}
                                className="w-full"
                                size="lg"
                            >
                                {status === "loading" ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Syncing...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Force Sync as Admin
                                    </>
                                )}
                            </Button>

                            {/* Current Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-blue-50 rounded">
                                    <p className="text-sm text-blue-600">Clerk Status</p>
                                    <p className="font-semibold">✅ Authenticated</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded">
                                    <p className="text-sm text-green-600">Database Status</p>
                                    <p className="font-semibold">
                                        {debugUsers?.users.find(u => u.clerkId === user.id)
                                            ? '✅ Synced'
                                            : '❌ Not Synced'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}