"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Play, FileText } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export const dynamic = 'force-dynamic';

interface TrainingModule {
    _id: Id<"trainingModules">;
    title: string;
    description: string;
    type: "video" | "document";
    contentUrl: string;
    quizId?: Id<"quizzes">;
}

export default function AdminTrainingPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<TrainingModule | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "video" as "video" | "document",
        contentUrl: "",
        quizId: ""
    });

    const modules = useQuery(api.training.list);
    const quizzes = useQuery(api.quizzes.list);
    const createModule = useMutation(api.training.create);
    const updateModule = useMutation(api.training.update);
    const removeModule = useMutation(api.training.remove);

    const handleCreate = async () => {
        try {
            await createModule({
                title: formData.title,
                description: formData.description,
                type: formData.type,
                contentUrl: formData.contentUrl,
                quizId: formData.quizId ? formData.quizId as Id<"quizzes"> : undefined
            });
            setFormData({
                title: "",
                description: "",
                type: "video",
                contentUrl: "",
                quizId: ""
            });
            setIsCreateDialogOpen(false);
            alert("Training module created successfully");
        } catch (error) {
            console.error("Failed to create module:", error);
            alert("Failed to create training module");
        }
    };

    const handleUpdate = async () => {
        if (!editingModule) return;
        try {
            await updateModule({
                id: editingModule._id,
                title: formData.title,
                description: formData.description,
                type: formData.type,
                contentUrl: formData.contentUrl,
                quizId: formData.quizId ? formData.quizId as Id<"quizzes"> : undefined
            });
            setEditingModule(null);
            setFormData({
                title: "",
                description: "",
                type: "video",
                contentUrl: "",
                quizId: ""
            });
            alert("Training module updated successfully");
        } catch (error) {
            console.error("Failed to update module:", error);
            alert("Failed to update training module");
        }
    };

    const handleDelete = async (id: Id<"trainingModules">) => {
        if (!confirm("Are you sure you want to delete this training module?")) return;
        try {
            await removeModule({ id });
            alert("Training module deleted successfully");
        } catch (error) {
            console.error("Failed to delete module:", error);
            alert("Failed to delete training module");
        }
    };

    const openEditDialog = (module: TrainingModule) => {
        setEditingModule(module);
        setFormData({
            title: module.title,
            description: module.description,
            type: module.type,
            contentUrl: module.contentUrl,
            quizId: module.quizId || ""
        });
    };

    if (!modules || !quizzes) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Training Management</h1>
                    <p className="text-muted-foreground">
                        Create and manage training modules for your organization
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Training Module
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Training Module</DialogTitle>
                            <DialogDescription>
                                Add a new training module that employees will need to complete.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Module Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter module title"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter module description"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="type">Content Type</Label>
                                <Select value={formData.type} onValueChange={(value: "video" | "document") => setFormData({ ...formData, type: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="document">Document</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="contentUrl">Content URL</Label>
                                <Input
                                    id="contentUrl"
                                    value={formData.contentUrl}
                                    onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                                    placeholder="Enter URL for video or document"
                                />
                            </div>
                            <div>
                                <Label htmlFor="quizId">Associated Quiz (Optional)</Label>
                                <Select value={formData.quizId} onValueChange={(value) => setFormData({ ...formData, quizId: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a quiz (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">No quiz</SelectItem>
                                        {quizzes.map((quiz) => (
                                            <SelectItem key={quiz._id} value={quiz._id}>
                                                {quiz.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate}>Create Module</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Training Modules</CardTitle>
                    <CardDescription>
                        Manage all training modules in your organization
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {modules.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No training modules created yet.</p>
                            <Button
                                className="mt-4"
                                onClick={() => setIsCreateDialogOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Module
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Quiz</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {modules.map((module) => (
                                    <TableRow key={module._id}>
                                        <TableCell className="font-medium">{module.title}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                {module.type === "video" ? (
                                                    <Play className="h-4 w-4 text-blue-500" />
                                                ) : (
                                                    <FileText className="h-4 w-4 text-green-500" />
                                                )}
                                                <span className="capitalize">{module.type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <div className="truncate text-sm text-muted-foreground">
                                                {module.description}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {module.quizId ? (
                                                <span className="text-sm text-green-600">Has Quiz</span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">No Quiz</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditDialog(module)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(module._id)}
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
            <Dialog open={!!editingModule} onOpenChange={() => setEditingModule(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Training Module</DialogTitle>
                        <DialogDescription>
                            Update the training module details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-title">Module Title</Label>
                            <Input
                                id="edit-title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter module title"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter module description"
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-type">Content Type</Label>
                            <Select value={formData.type} onValueChange={(value: "video" | "document") => setFormData({ ...formData, type: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="document">Document</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-contentUrl">Content URL</Label>
                            <Input
                                id="edit-contentUrl"
                                value={formData.contentUrl}
                                onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                                placeholder="Enter URL for video or document"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-quizId">Associated Quiz (Optional)</Label>
                            <Select value={formData.quizId} onValueChange={(value) => setFormData({ ...formData, quizId: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a quiz (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">No quiz</SelectItem>
                                    {quizzes.map((quiz) => (
                                        <SelectItem key={quiz._id} value={quiz._id}>
                                            {quiz.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingModule(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>Update Module</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}