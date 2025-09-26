"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = 'force-dynamic';

export default function PoliciesPage() {
    const policies = useQuery(api.policies.list);

    if (!policies) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Security Policies</h1>
                    <p className="text-muted-foreground">
                        Review and acknowledge our security policies and procedures
                    </p>
                </div>
                <Badge variant="outline">{policies.length} Policies</Badge>
            </div>

            {policies.length === 0 ? (
                <Card>
                    <CardContent className="flex items-center justify-center h-32">
                        <p className="text-muted-foreground">No policies available yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {policies.map((policy) => (
                        <Card key={policy._id}>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <CardTitle>{policy.title}</CardTitle>
                                    <Badge variant="secondary" className="text-xs">
                                        Policy
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none">
                                    <div
                                        className="whitespace-pre-wrap text-sm"
                                        dangerouslySetInnerHTML={{
                                            __html: policy.content.replace(/\n/g, '<br />')
                                        }}
                                    />
                                </div>
                                <Separator className="my-4" />
                                <p className="text-sm text-muted-foreground">
                                    Please review this policy carefully and contact your administrator if you have any questions.
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}