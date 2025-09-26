"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserCheck, Shield, Crown, History, TrendingUp, AlertTriangle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [newRole, setNewRole] = useState<"admin" | "employee">("employee");
    const [reason, setReason] = useState("");
    const [showAuditLog, setShowAuditLog] = useState(false);
    const [auditUserId, setAuditUserId] = useState<string | null>(null);

    const complianceReport = useQuery(api.reports.getComplianceReport);
    const userProgressReport = useQuery(api.reports.getUserProgressReport);
    const users = useQuery(api.users.listUsers);
    const auditLog = useQuery(api.users.getRoleAuditLog,
        auditUserId ? { userId: auditUserId } : {}
    );

    const updateUserRole = useMutation(api.users.updateUserRole);

    if (!complianceReport || !userProgressReport) {
        return <div>Loading...</div>;
    }

    const handleRoleChange = async () => {
        if (!selectedUser) return;

        try {
            await updateUserRole({
                userId: selectedUser._id,
                newRole: newRole,
                reason: reason || undefined,
            });

            setSelectedUser(null);
            setReason("");
        } catch (error) {
            console.error("Failed to update user role:", error);
        }
    };

    const openRoleDialog = (user: any) => {
        setSelectedUser(user);
        setNewRole(user.role === "admin" ? "employee" : "admin");
        setReason("");
    };

    const viewAuditLog = (userId: string) => {
        setAuditUserId(userId);
        setShowAuditLog(true);
    };

    // Role management statistics
    const adminCount = users?.filter(u => u.role === "admin").length || 0;
    const employeeCount = users?.filter(u => u.role === "employee").length || 0;
    const totalUsers = users?.length || 0;
    const recentRoleChanges = auditLog?.slice(0, 5) || [];

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <Badge variant="outline">Compliance Overview</Badge>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="modules">Module Completion</TabsTrigger>
                    <TabsTrigger value="quizzes">Quiz Results</TabsTrigger>
                    <TabsTrigger value="users">User Progress</TabsTrigger>
                    <TabsTrigger value="roles">Role Management</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{complianceReport.totalUsers}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completed Training</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{complianceReport.completedUsers}</div>
                                <p className="text-xs text-muted-foreground">
                                    {complianceReport.totalUsers > 0
                                        ? Math.round((complianceReport.completedUsers / complianceReport.totalUsers) * 100)
                                        : 0}% completion rate
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{complianceReport.inProgressUsers}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Average Quiz Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{complianceReport.averageScore}%</div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="modules" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Module Completion Rates</CardTitle>
                            <CardDescription>
                                Training module completion statistics across all users
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {complianceReport.moduleCompletion.map((module) => (
                                    <div key={module.moduleId} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{module.moduleName}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {module.completed}/{module.total} ({Math.round(module.completionRate)}%)
                                            </span>
                                        </div>
                                        <Progress value={module.completionRate} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="quizzes" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quiz Performance</CardTitle>
                            <CardDescription>
                                Quiz pass rates and average scores
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Quiz Name</TableHead>
                                        <TableHead>Pass Rate</TableHead>
                                        <TableHead>Attempts</TableHead>
                                        <TableHead>Passed</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {complianceReport.quizResults
                                        .filter(quiz => quiz !== null)
                                        .map((quiz) => (
                                            <TableRow key={quiz.quizId}>
                                                <TableCell className="font-medium">{quiz.quizName}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Progress value={quiz.passRate} className="w-16 h-2" />
                                                        <span className="text-sm">{Math.round(quiz.passRate)}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{quiz.total}</TableCell>
                                                <TableCell>{quiz.passed}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Progress Details</CardTitle>
                            <CardDescription>
                                Individual user training completion status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Modules Completed</TableHead>
                                        <TableHead>Completion Rate</TableHead>
                                        <TableHead>Last Activity</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userProgressReport.map((user) => (
                                        <TableRow key={user.userId}>
                                            <TableCell className="font-medium">{user.userName}</TableCell>
                                            <TableCell>{user.userEmail}</TableCell>
                                            <TableCell>{user.completedModules}/{user.totalModules}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Progress value={user.completionRate} className="w-16 h-2" />
                                                    <span className="text-sm">{Math.round(user.completionRate)}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.lastActivity
                                                    ? new Date(user.lastActivity).toLocaleDateString()
                                                    : "No activity"
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="roles" className="space-y-4">
                    {/* Role Management Overview */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalUsers}</div>
                                <p className="text-xs text-muted-foreground">
                                    Registered system users
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                                <Crown className="h-4 w-4 text-yellow-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{adminCount}</div>
                                <p className="text-xs text-muted-foreground">
                                    {totalUsers > 0 ? Math.round((adminCount / totalUsers) * 100) : 0}% of total users
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Employees</CardTitle>
                                <UserCheck className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{employeeCount}</div>
                                <p className="text-xs text-muted-foreground">
                                    {totalUsers > 0 ? Math.round((employeeCount / totalUsers) * 100) : 0}% of total users
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Role Distribution</CardTitle>
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span>Admin</span>
                                        <span>{adminCount}</span>
                                    </div>
                                    <Progress value={totalUsers > 0 ? (adminCount / totalUsers) * 100 : 0} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Role Management Actions */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                    User Role Management
                                </CardTitle>
                                <CardDescription>
                                    Manage user roles and permissions across the system
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users?.slice(0, 5).map((user) => (
                                            <TableRow key={user._id}>
                                                <TableCell className="font-medium">
                                                    {user.firstName || user.lastName ?
                                                        `${user.firstName || ''} ${user.lastName || ''}`.trim() :
                                                        'No name set'
                                                    }
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                                        {user.role === "admin" ? (
                                                            <span className="flex items-center gap-1">
                                                                <Crown className="h-3 w-3" />
                                                                Admin
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1">
                                                                <UserCheck className="h-3 w-3" />
                                                                Employee
                                                            </span>
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openRoleDialog(user)}
                                                        >
                                                            Change
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => viewAuditLog(user.clerkId)}
                                                        >
                                                            <History className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {users && users.length > 5 && (
                                    <div className="mt-4 text-center">
                                        <Button variant="outline" asChild>
                                            <a href="/admin/users">View All Users ({users.length})</a>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5 text-purple-600" />
                                    Recent Role Changes
                                </CardTitle>
                                <CardDescription>
                                    Latest role modifications and audit trail
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentRoleChanges.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentRoleChanges.map((log) => (
                                            <div key={log._id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        {log.newRole === "admin" ? (
                                                            <Crown className="h-4 w-4 text-yellow-600" />
                                                        ) : (
                                                            <UserCheck className="h-4 w-4 text-green-600" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium">
                                                            Role changed to {log.newRole}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            By {log.performedBy} • {new Date(log.timestamp).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {log.action}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No recent role changes found.</p>
                                        <p className="text-xs mt-1">Role modifications will appear here.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Role Change Dialog */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                            Update the role for {selectedUser?.firstName || selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="role">New Role</Label>
                            <Select value={newRole} onValueChange={(value) => setNewRole(value as "admin" | "employee")}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="employee">
                                        <div className="flex items-center gap-2">
                                            <UserCheck className="h-4 w-4" />
                                            Employee
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="admin">
                                        <div className="flex items-center gap-2">
                                            <Crown className="h-4 w-4" />
                                            Administrator
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="reason">Reason for Change</Label>
                            <Textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter reason for role change (required)..."
                                rows={3}
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="text-sm">
                                <span className="font-medium">Current:</span>{" "}
                                <Badge variant="outline">{selectedUser?.role}</Badge>
                            </div>
                            <div className="text-sm">
                                <span className="font-medium">New:</span>{" "}
                                <Badge variant="outline">{newRole}</Badge>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedUser(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleRoleChange} disabled={!reason.trim()}>
                            Update Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Audit Log Dialog */}
            <Dialog open={showAuditLog} onOpenChange={setShowAuditLog}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Role Change History</DialogTitle>
                        <DialogDescription>
                            Complete audit trail of role modifications
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {auditLog && auditLog.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>From</TableHead>
                                        <TableHead>To</TableHead>
                                        <TableHead>Performed By</TableHead>
                                        <TableHead>Reason</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {auditLog.map((log) => (
                                        <TableRow key={log._id}>
                                            <TableCell>
                                                {new Date(log.timestamp).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{log.action}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {log.previousRole || 'N/A'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="default">
                                                    {log.newRole || 'N/A'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{log.performedBy}</TableCell>
                                            <TableCell className="max-w-xs">
                                                <span className="text-sm">
                                                    {log.reason || 'No reason provided'}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No role changes found for this user.</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAuditLog(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}