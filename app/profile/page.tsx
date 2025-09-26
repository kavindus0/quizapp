"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Bell, Activity, Award } from "lucide-react";
import TwoFactorAuth from "@/components/TwoFactorAuth";
import { useUserRole } from "@/hooks/use-user-role";

export default function ProfilePage() {
    const { user, isLoaded } = useUser();
    const { role, isLoading: roleLoading } = useUserRole();

    if (!isLoaded || roleLoading || !user) {
        return (
            <div className="container mx-auto p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your Royal Credit Recoveries account security and preferences
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile" className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <span>Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex items-center space-x-2">
                        <Activity className="h-4 w-4" />
                        <span>Activity</span>
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                Your basic account information and role at Royal Credit Recoveries
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <img
                                    src={user.imageUrl}
                                    alt="Profile"
                                    className="h-16 w-16 rounded-full border-2 border-gray-200"
                                />
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold">
                                        {user.firstName} {user.lastName}
                                    </h3>
                                    <p className="text-muted-foreground">{user.emailAddresses[0]?.emailAddress}</p>
                                    <Badge variant={role === 'admin' ? 'destructive' : 'default'}>
                                        {role === 'admin' ? 'Administrator' : 'Employee'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">First Name</label>
                                    <p className="text-gray-900">{user.firstName || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                                    <p className="text-gray-900">{user.lastName || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <p className="text-gray-900">{user.emailAddresses[0]?.emailAddress}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Member Since</label>
                                    <p className="text-gray-900">
                                        {new Date(user.createdAt!).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Department</label>
                                    <p className="text-gray-900">Call & Data Handling</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Role</label>
                                    <p className="text-gray-900 capitalize">{role}</p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button variant="outline">Edit Profile</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Training Progress Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Award className="h-5 w-5 text-yellow-600" />
                                <span>Training Progress</span>
                            </CardTitle>
                            <CardDescription>
                                Your security awareness training completion status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Cybersecurity Fundamentals</span>
                                    <Badge variant="default">Completed</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Password Security</span>
                                    <Badge variant="default">Completed</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Phishing Awareness</span>
                                    <Badge variant="secondary">In Progress</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Data Protection (PCI DSS)</span>
                                    <Badge variant="outline">Not Started</Badge>
                                </div>
                            </div>
                            <div className="pt-4">
                                <Button variant="outline" size="sm">View Full Progress</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    <TwoFactorAuth />

                    {/* Password Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Password & Login</CardTitle>
                            <CardDescription>
                                Manage your password and login preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Password</p>
                                        <p className="text-sm text-muted-foreground">
                                            Last changed {new Date().toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Button variant="outline">Change Password</Button>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-medium mb-2">Login Sessions</h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Manage your active login sessions across devices
                                </p>
                                <Button variant="outline" size="sm">Manage Sessions</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Configure how you receive security alerts and training reminders
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Security Alerts</p>
                                        <p className="text-sm text-muted-foreground">
                                            Receive alerts about security incidents and policy updates
                                        </p>
                                    </div>
                                    <Badge variant="default">Enabled</Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Training Reminders</p>
                                        <p className="text-sm text-muted-foreground">
                                            Get notified about upcoming training deadlines
                                        </p>
                                    </div>
                                    <Badge variant="default">Enabled</Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Policy Updates</p>
                                        <p className="text-sm text-muted-foreground">
                                            Notifications when security policies are updated
                                        </p>
                                    </div>
                                    <Badge variant="default">Enabled</Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Quiz Results</p>
                                        <p className="text-sm text-muted-foreground">
                                            Receive immediate feedback on quiz performance
                                        </p>
                                    </div>
                                    <Badge variant="default">Enabled</Badge>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button variant="outline">Configure Notifications</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Your recent security training and system activity
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <Award className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Completed Password Security Quiz</p>
                                        <p className="text-xs text-muted-foreground">Score: 95% • 2 hours ago</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Reviewed Data Protection Policy</p>
                                        <p className="text-xs text-muted-foreground">Yesterday at 3:42 PM</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <User className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Profile Updated</p>
                                        <p className="text-xs text-muted-foreground">3 days ago</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                                        <Bell className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Security Alert Acknowledged</p>
                                        <p className="text-xs text-muted-foreground">Last week</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button variant="outline" size="sm">View Full Activity Log</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}