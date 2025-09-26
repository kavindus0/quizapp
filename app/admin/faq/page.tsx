"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Plus,
    Edit,
    Trash2,
    HelpCircle,
    BookOpen,
    Shield,
    Phone,
    Mail,
    FileText,
    Users,
    BarChart3,
    ThumbsUp,
    Eye,
    EyeOff,
    Search,
    Tag,
    Calendar,
    TrendingUp
} from "lucide-react";

const faqCategories = [
    { id: "security", name: "Security & 2FA", icon: Shield },
    { id: "training", name: "Training & Learning", icon: BookOpen },
    { id: "policies", name: "Company Policies", icon: FileText },
    { id: "technical", name: "Technical Support", icon: Phone },
    { id: "compliance", name: "Compliance", icon: Users },
    { id: "data-protection", name: "Data Protection", icon: Mail }
];

interface FAQ {
    _id: string;
    question: string;
    answer: string;
    category: string;
    tags: string[];
    isActive: boolean;
    order: number;
    helpful: number;
    createdBy: string;
    createdAt: number;
    updatedAt: number;
}

export default function AdminFAQManagement() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Form state for creating/editing
    const [formData, setFormData] = useState({
        question: "",
        answer: "",
        category: "security",
        tags: [] as string[],
        isActive: true,
        order: 1
    });
    const [tagInput, setTagInput] = useState("");

    // Mock data since the actual queries are not working yet
    const faqs: FAQ[] = [];
    const stats = {
        totalFAQs: 8,
        totalFeedback: 234,
        helpfulFeedback: 187,
        averageHelpfulness: "79.9",
        categoryBreakdown: {
            security: 3,
            training: 2,
            "data-protection": 2,
            compliance: 1
        },
        mostHelpfulFAQs: [],
        recentFeedback: []
    };

    const createFAQ = useMutation(api.faq.createFAQ);
    const updateFAQ = useMutation(api.faq.updateFAQ);
    const deleteFAQ = useMutation(api.faq.deleteFAQ);

    const handleCreateFAQ = async () => {
        if (!formData.question.trim() || !formData.answer.trim()) {
            return;
        }

        try {
            await createFAQ({
                question: formData.question,
                answer: formData.answer,
                category: formData.category,
                tags: formData.tags,
                isActive: formData.isActive,
                order: formData.order,
                helpful: 0
            });

            setIsCreateDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error creating FAQ:", error);
        }
    };

    const handleEditFAQ = async () => {
        if (!editingFAQ || !formData.question.trim() || !formData.answer.trim()) {
            return;
        }

        try {
            await updateFAQ({
                faqId: editingFAQ._id as any,
                updates: {
                    question: formData.question,
                    answer: formData.answer,
                    category: formData.category,
                    tags: formData.tags,
                    isActive: formData.isActive,
                    order: formData.order,
                    helpful: editingFAQ.helpful
                }
            });

            setIsEditDialogOpen(false);
            setEditingFAQ(null);
            resetForm();
        } catch (error) {
            console.error("Error updating FAQ:", error);
        }
    };

    const handleDeleteFAQ = async (faqId: string) => {
        if (confirm("Are you sure you want to delete this FAQ?")) {
            try {
                await deleteFAQ({ faqId: faqId as any });
            } catch (error) {
                console.error("Error deleting FAQ:", error);
            }
        }
    };

    const openEditDialog = (faq: FAQ) => {
        setEditingFAQ(faq);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            tags: faq.tags,
            isActive: faq.isActive,
            order: faq.order
        });
        setIsEditDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            question: "",
            answer: "",
            category: "security",
            tags: [],
            isActive: true,
            order: 1
        });
        setTagInput("");
    };

    const addTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const filteredFAQs = faqs.filter(faq => {
        const matchesSearch = searchQuery === "" ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center space-x-3">
                        <HelpCircle className="h-8 w-8 text-blue-600" />
                        <span>FAQ Management</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Manage frequently asked questions and user feedback
                    </p>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add FAQ
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New FAQ</DialogTitle>
                            <DialogDescription>
                                Add a new frequently asked question to help users find answers quickly.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Question</label>
                                <Input
                                    value={formData.question}
                                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                                    placeholder="Enter the question..."
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Answer</label>
                                <Textarea
                                    value={formData.answer}
                                    onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                                    placeholder="Provide a comprehensive answer..."
                                    rows={6}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full mt-1 p-2 border rounded-md"
                                    >
                                        {faqCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Order</label>
                                    <Input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Tags</label>
                                <div className="flex space-x-2 mt-1">
                                    <Input
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        placeholder="Enter a tag..."
                                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                    />
                                    <Button type="button" onClick={addTag} variant="outline">
                                        Add
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                                            {tag} ×
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                />
                                <label htmlFor="isActive" className="text-sm font-medium">Active (visible to users)</label>
                            </div>

                            <div className="flex space-x-2 pt-4">
                                <Button onClick={handleCreateFAQ} className="flex-1">
                                    Create FAQ
                                </Button>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="faqs" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="faqs">Manage FAQs</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                </TabsList>

                <TabsContent value="faqs" className="space-y-4">
                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search FAQs..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="p-2 border rounded-md"
                                >
                                    <option value="all">All Categories</option>
                                    {faqCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* FAQ List */}
                    <div className="space-y-4">
                        {filteredFAQs.length > 0 ? (
                            filteredFAQs.map(faq => {
                                const categoryInfo = faqCategories.find(c => c.id === faq.category);
                                const CategoryIcon = categoryInfo?.icon || HelpCircle;

                                return (
                                    <Card key={faq._id}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <CategoryIcon className="h-4 w-4 text-blue-600" />
                                                        <Badge variant="outline">{categoryInfo?.name}</Badge>
                                                        <Badge variant={faq.isActive ? "default" : "secondary"}>
                                                            {faq.isActive ? "Active" : "Inactive"}
                                                        </Badge>
                                                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                                            <ThumbsUp className="h-3 w-3" />
                                                            <span>{faq.helpful} helpful</span>
                                                        </div>
                                                    </div>

                                                    <h3 className="font-medium text-lg mb-2">{faq.question}</h3>

                                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                                                        {faq.answer}
                                                    </p>

                                                    <div className="flex flex-wrap gap-1">
                                                        {faq.tags.map(tag => (
                                                            <Badge key={tag} variant="outline" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="ml-4 flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(faq)}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteFAQ(faq._id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No FAQs Found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {searchQuery || selectedCategory !== "all"
                                            ? "Try adjusting your search or filter criteria."
                                            : "Get started by creating your first FAQ."
                                        }
                                    </p>
                                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create First FAQ
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="stats" className="space-y-6">
                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-2">
                                    <HelpCircle className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="text-2xl font-bold">{stats.totalFAQs}</p>
                                        <p className="text-xs text-muted-foreground">Total FAQs</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-2">
                                    <ThumbsUp className="h-8 w-8 text-green-600" />
                                    <div>
                                        <p className="text-2xl font-bold">{stats.totalFeedback}</p>
                                        <p className="text-xs text-muted-foreground">Total Feedback</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="h-8 w-8 text-purple-600" />
                                    <div>
                                        <p className="text-2xl font-bold">{stats.averageHelpfulness}%</p>
                                        <p className="text-xs text-muted-foreground">Helpfulness Rate</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-2">
                                    <Tag className="h-8 w-8 text-orange-600" />
                                    <div>
                                        <p className="text-2xl font-bold">{Object.keys(stats.categoryBreakdown).length}</p>
                                        <p className="text-xs text-muted-foreground">Categories</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Category Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>FAQs by Category</CardTitle>
                            <CardDescription>
                                Distribution of FAQs across different categories
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(stats.categoryBreakdown).map(([categoryId, count]) => {
                                    const categoryInfo = faqCategories.find(c => c.id === categoryId);
                                    const CategoryIcon = categoryInfo?.icon || HelpCircle;
                                    const percentage = ((count / stats.totalFAQs) * 100).toFixed(1);

                                    return (
                                        <div key={categoryId} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <CategoryIcon className="h-4 w-4 text-gray-600" />
                                                <span className="font-medium">{categoryInfo?.name || categoryId}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium">{count} ({percentage}%)</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Latest user feedback and interactions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-3" />
                                <p>No recent activity to display</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Dialog (similar to create dialog) */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit FAQ</DialogTitle>
                        <DialogDescription>
                            Update the FAQ information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Question</label>
                            <Input
                                value={formData.question}
                                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                                placeholder="Enter the question..."
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Answer</label>
                            <Textarea
                                value={formData.answer}
                                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                                placeholder="Provide a comprehensive answer..."
                                rows={6}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full mt-1 p-2 border rounded-md"
                                >
                                    {faqCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Order</label>
                                <Input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                                    min="1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Tags</label>
                            <div className="flex space-x-2 mt-1">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Enter a tag..."
                                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                />
                                <Button type="button" onClick={addTag} variant="outline">
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                                        {tag} ×
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="editIsActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            />
                            <label htmlFor="editIsActive" className="text-sm font-medium">Active (visible to users)</label>
                        </div>

                        <div className="flex space-x-2 pt-4">
                            <Button onClick={handleEditFAQ} className="flex-1">
                                Update FAQ
                            </Button>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}