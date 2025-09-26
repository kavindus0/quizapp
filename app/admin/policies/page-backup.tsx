"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FileText, Users, CheckCircle } from "lucide-react";

interface Policy {
    _id: Id<"policies">;
    title: string;
    content: string;
}

export default function PoliciesPage() {
    const { user } = useUser();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
    });

    const policies = useQuery(api.policies.getAllPolicies) || [];
    const createPolicy = useMutation(api.policies.create);
    const updatePolicy = useMutation(api.policies.update);
    const removePolicy = useMutation(api.policies.remove);

    const resetForm = () => {
        setFormData({
            title: "",
            content: "",
        });
    };

    const handleCreate = async () => {
        if (!user) return;

        try {
            await createPolicy({
                title: formData.title,
                content: formData.content,
            });

            setIsCreateDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error("Failed to create policy:", error);
        }
    };

    const handleUpdate = async () => {
        if (!editingPolicy || !user) return;

        try {
            await updatePolicy({
                id: editingPolicy._id,
                title: formData.title,
                content: formData.content,
            });

            setEditingPolicy(null);
            resetForm();
        } catch (error) {
            console.error("Failed to update policy:", error);
        }
    };

    const handleDelete = async (id: Id<"policies">) => {
        if (!confirm("Are you sure you want to delete this policy?")) return;

        try {
            await removePolicy({ id });
        } catch (error) {
            console.error("Failed to delete policy:", error);
        }
    };

    const openEditDialog = (policy: Policy) => {
        setEditingPolicy(policy);
        setFormData({
            title: policy.title,
            content: policy.content,
        });
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Security Policies</h1>
                    <p className="text-muted-foreground">
                        Manage security policies and compliance requirements
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Policy
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Policy</DialogTitle>
                            <DialogDescription>
                                Add a new security policy for your organization
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Policy Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter policy title"
                                />
                            </div>
                            <div>
                                <Label htmlFor="content">Policy Content</Label>
                                <Textarea
                                    id="content"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Enter policy content"
                                    rows={8}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate}>Create Policy</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium">Total Policies</p>
                                <p className="text-2xl font-bold">{policies.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="text-sm font-medium">Active Policies</p>
                                <p className="text-2xl font-bold">{policies.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Users className="h-8 w-8 text-purple-600" />
                            <div>
                                <p className="text-sm font-medium">Compliance Rate</p>
                                <p className="text-2xl font-bold">100%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Policies Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Policies</CardTitle>
                    <CardDescription>
                        View and manage all security policies
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {policies.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">No policies created yet</p>
                            <p className="text-gray-600">Create your first policy to get started.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Content Preview</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {policies.map((policy) => (
                                    <TableRow key={policy._id}>
                                        <TableCell className="font-medium">{policy.title}</TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {policy.content.substring(0, 100)}...
                                        </TableCell>
                                        <TableCell>
                                            <Badge>Active</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditDialog(policy)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(policy._id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={!!editingPolicy} onOpenChange={() => setEditingPolicy(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Policy</DialogTitle>
                        <DialogDescription>
                            Update the policy information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-title">Policy Title</Label>
                            <Input
                                id="edit-title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter policy title"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-content">Policy Content</Label>
                            <Textarea
                                id="edit-content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Enter policy content"
                                rows={8}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingPolicy(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>Update Policy</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}