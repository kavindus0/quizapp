"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, History } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export const dynamic = 'force-dynamic';

export default function AdminUsersPage() {
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [newRole, setNewRole] = useState<"admin" | "employee">("employee");
    const [reason, setReason] = useState("");
    const [showAuditLog, setShowAuditLog] = useState(false);
    const [auditUserId, setAuditUserId] = useState<string | null>(null);

    const users = useQuery(api.users.listUsers);
    const auditLog = useQuery(api.users.getRoleAuditLog,
        auditUserId ? { userId: auditUserId } : {}
    );
    const updateUserRole = useMutation(api.users.updateUserRole);

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
            alert("User role updated successfully!");
        } catch (error) {
            console.error("Failed to update user role:", error);
            alert("Failed to update user role");
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

    if (!users) {
        return <div>Loading...</div>;
    }

    const adminCount = users.filter(u => u.role === "admin").length;
    const employeeCount = users.filter(u => u.role === "employee").length;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage user roles and permissions
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{adminCount} Admins</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{employeeCount} Employees</span>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                        Manage user roles and view activity
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell className="font-medium">
                                        {user.firstName || user.lastName ?
                                            `${user.firstName || ''} ${user.lastName || ''}`.trim() :
                                            'No name set'
                                        }
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openRoleDialog(user)}
                                            >
                                                Change Role
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => viewAuditLog(user.clerkId)}
                                            >
                                                <History className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

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
                                    <SelectItem value="employee">Employee</SelectItem>
                                    <SelectItem value="admin">Administrator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="reason">Reason for Change (Optional)</Label>
                            <Textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter reason for role change..."
                                rows={3}
                            />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Current role: <Badge variant="outline">{selectedUser?.role}</Badge> →
                            New role: <Badge variant="outline">{newRole}</Badge>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedUser(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleRoleChange}>
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
                            View all role changes for this user
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
                                            <TableCell>{log.previousRole || 'N/A'}</TableCell>
                                            <TableCell>{log.newRole || 'N/A'}</TableCell>
                                            <TableCell>{log.performedBy}</TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {log.reason || 'No reason provided'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No role changes found for this user.
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