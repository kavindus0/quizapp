"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";

export function UserSync() {
    const { user, isLoaded } = useUser();
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

    const syncUserFromClerk = useMutation(api.users.syncUserFromClerk);

    useEffect(() => {
        const syncUser = async () => {
            if (!isLoaded || !user || syncStatus !== 'idle') return;

            try {
                setSyncStatus('syncing');

                await syncUserFromClerk({
                    clerkId: user.id,
                    email: user.primaryEmailAddress?.emailAddress || "",
                    firstName: user.firstName || undefined,
                    lastName: user.lastName || undefined,
                    forceAdmin: false, // Let the system decide based on existing admins
                });

                setSyncStatus('synced');
            } catch (error) {
                console.error("User sync failed:", error);
                setSyncStatus('error');
            }
        };

        syncUser();
    }, [isLoaded, user, syncStatus, syncUserFromClerk]);

    // Optional: Show sync status in development
    if (process.env.NODE_ENV === 'development' && syncStatus === 'syncing') {
        return (
            <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded text-sm">
                Syncing user...
            </div>
        );
    }

    return null;
}