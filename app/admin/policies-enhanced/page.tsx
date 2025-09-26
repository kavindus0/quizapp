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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Plus,
    Edit,
    Trash2,
    FileText,
    Users,
    CheckCircle,
    AlertCircle,
    Eye,
    CheckSquare,
    Shield
} from "lucide-react";
import { usePermissions } from "@/hooks/use-user-role";

export const dynamic = 'force-dynamic';

interface Policy {
    _id: Id<"policies">;
    title: string;
    content: string;
    summary?: string;
    category?: string;
    version?: string;
    status?: string;
    requiresAcknowledgment?: boolean;
    createdAt?: number;
}

export default function AdminPoliciesPage() {
    const { user } = useUser();
    const { canManagePolicies, isLoading: permissionsLoading } = usePermissions();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
    const [viewingPolicy, setViewingPolicy] = useState<Policy | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: "general_security"
    });

    const policies = useQuery(api.policies.getAllPolicies) || [];
    const createPolicy = useMutation(api.policies.create);
    const updatePolicy = useMutation(api.policies.update);
    const removePolicy = useMutation(api.policies.remove);

    const resetForm = () => {
        setFormData({
            title: "",
            content: "",
            category: "general_security"
        });
    };

    const handleCreate = async () => {
        if (!user || !canManagePolicies) return;

        try {
            await createPolicy({
                title: formData.title,
                content: formData.content,
            });

            setIsCreateDialogOpen(false);
            resetForm();
            alert("Policy created successfully!");
        } catch (error) {
            console.error("Failed to create policy:", error);
            alert("Failed to create policy");
        }
    };

    const handleUpdate = async () => {
        if (!editingPolicy || !user || !canManagePolicies) return;

        try {
            await updatePolicy({
                id: editingPolicy._id,
                title: formData.title,
                content: formData.content,
            });

            setEditingPolicy(null);
            resetForm();
            alert("Policy updated successfully!");
        } catch (error) {
            console.error("Failed to update policy:", error);
            alert("Failed to update policy");
        }
    };

    const handleDelete = async (id: Id<"policies">) => {
        if (!confirm("Are you sure you want to delete this policy?")) return;

        try {
            await removePolicy({ id });
            alert("Policy deleted successfully!");
        } catch (error) {
            console.error("Failed to delete policy:", error);
            alert("Failed to delete policy");
        }
    };

    const openEditDialog = (policy: Policy) => {
        setEditingPolicy(policy);
        setFormData({
            title: policy.title,
            content: policy.content,
            category: policy.category || "general_security"
        });
    };

    const getCategoryDisplayName = (category: string) => {
        const categories: Record<string, string> = {
            "data_protection": "Data Protection",
            "pci_compliance": "PCI DSS Compliance",
            "general_security": "General Security",
            "incident_response": "Incident Response",
            "access_control": "Access Control",
            "acceptable_use": "Acceptable Use"
        };
        return categories[category] || category;
    };

    const getStatusBadge = (policy: Policy) => {
        const status = policy.status || "active";
        const color = status === "active" ? "default" : status === "draft" ? "secondary" : "outline";
        return <Badge variant={color}>{status}</Badge>;
    };

    if (permissionsLoading) {
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

    if (!canManagePolicies) {
        return (
            <div className="container mx-auto p-6">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You don't have permission to manage policies. Contact your administrator.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center space-x-2">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <span>Policy Management</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage security policies for Royal Credit Recoveries employees
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
                            <DialogTitle>Create New Security Policy</DialogTitle>
                            <DialogDescription>
                                Create a new security policy for Royal Credit Recoveries employees
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Policy Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Customer Data Protection Policy"
                                />
                            </div>
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="data_protection">Data Protection</SelectItem>
                                        <SelectItem value="pci_compliance">PCI DSS Compliance</SelectItem>
                                        <SelectItem value="general_security">General Security</SelectItem>
                                        <SelectItem value="incident_response">Incident Response</SelectItem>
                                        <SelectItem value="access_control">Access Control</SelectItem>
                                        <SelectItem value="acceptable_use">Acceptable Use</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="content">Policy Content</Label>
                                <Textarea
                                    id="content"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Enter the complete policy content (Markdown supported)"
                                    rows={12}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-blue-600" />
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
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                                <p className="text-sm font-medium">Active</p>
                                <p className="text-2xl font-bold">{policies.filter(p => (p.status || "active") === "active").length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-purple-600" />
                            <div>
                                <p className="text-sm font-medium">Requires Acknowledgment</p>
                                <p className="text-2xl font-bold">{policies.filter(p => p.requiresAcknowledgment !== false).length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-amber-600" />
                            <div>
                                <p className="text-sm font-medium">Compliance Ready</p>
                                <p className="text-2xl font-bold">100%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Policies Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Security Policies</CardTitle>
                    <CardDescription>
                        All security policies for Royal Credit Recoveries
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {policies.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">No policies created yet</p>
                            <p className="text-gray-600 mb-4">
                                Create your first security policy to get started with compliance management.
                            </p>
                            <Button onClick={() => setIsCreateDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Policy
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Policy Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Acknowledgment Required</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {policies.map((policy) => (
                                    <TableRow key={policy._id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{policy.title}</div>
                                                {policy.summary && (
                                                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                                                        {policy.summary}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {getCategoryDisplayName(policy.category || "general_security")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(policy)}
                                        </TableCell>
                                        <TableCell>
                                            {policy.requiresAcknowledgment !== false ? (
                                                <div className="flex items-center space-x-1 text-green-600">
                                                    <CheckSquare className="h-4 w-4" />
                                                    <span className="text-sm">Required</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Not required</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setViewingPolicy(policy)}
                                                >
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditDialog(policy)}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(policy._id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
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

            {/* Edit Policy Dialog */}
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
                                placeholder="Enter policy content (Markdown supported)"
                                rows={12}
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

            {/* View Policy Dialog */}
            <Dialog open={!!viewingPolicy} onOpenChange={() => setViewingPolicy(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{viewingPolicy?.title}</DialogTitle>
                        <DialogDescription>
                            Policy content preview
                        </DialogDescription>
                    </DialogHeader>
                    <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm">
                            {viewingPolicy?.content}
                        </pre>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewingPolicy(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}