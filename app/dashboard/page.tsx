"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useUserRole } from "@/hooks/use-user-role";
import EnhancedUserDashboard from "@/components/EnhancedUserDashboard";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, BookOpen, FileText, Award, Activity, Users, CheckCircle, AlertCircle, Plus, Edit, Trash2, Eye, Calendar } from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

export const dynamic = 'force-dynamic';

// Policy Management Component
function PolicyManagementSection({ error, message, setError, setMessage }: {
    error: string;
    message: string;
    setError: (error: string) => void;
    setMessage: (message: string) => void;
}) {
    const [showPolicyManagement, setShowPolicyManagement] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        summary: "",
        category: "general_security",
        version: "1.0",
        requiresAcknowledgment: true,
        tags: ""
    });

    // Queries and mutations for policy management
    const allPolicies = useQuery(api.policies.getAllPolicies);
    const createPolicy = useMutation(api.policies.createPolicy);
    const updatePolicy = useMutation(api.policies.updatePolicy);
    const deletePolicy = useMutation(api.policies.deletePolicy);
    const approvePolicy = useMutation(api.policies.approvePolicy);

    const handleCreatePolicy = async () => {
        if (!formData.title || !formData.content) {
            setError("Title and content are required");
            return;
        }

        try {
            setError("");
            setMessage("");
            await createPolicy({
                title: formData.title,
                content: formData.content,
                summary: formData.summary || formData.title,
                category: formData.category,
                version: formData.version,
                effectiveDate: Date.now(),
                requiresAcknowledgment: formData.requiresAcknowledgment,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                createdBy: "Admin"
            });
            setMessage("Policy created successfully!");
            setShowCreateDialog(false);
            resetForm();
        } catch (err) {
            setError(`Error creating policy: ${err}`);
        }
    };

    const handleUpdatePolicy = async () => {
        if (!editingPolicy || !formData.title || !formData.content) {
            setError("Title and content are required");
            return;
        }

        try {
            setError("");
            setMessage("");
            await updatePolicy({
                id: editingPolicy._id,
                title: formData.title,
                content: formData.content,
                summary: formData.summary || formData.title,
                category: formData.category,
                version: formData.version,
                effectiveDate: Date.now(),
                requiresAcknowledgment: formData.requiresAcknowledgment,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
            });
            setMessage("Policy updated successfully!");
            setEditingPolicy(null);
            resetForm();
        } catch (err) {
            setError(`Error updating policy: ${err}`);
        }
    };

    const handleDeletePolicy = async (policyId: string) => {
        if (!confirm("Are you sure you want to delete this policy? This action cannot be undone.")) {
            return;
        }

        try {
            setError("");
            setMessage("");
            await deletePolicy({ id: policyId as Id<"policies"> });
            setMessage("Policy deleted successfully!");
        } catch (err) {
            setError(`Error deleting policy: ${err}`);
        }
    };

    const handleApprovePolicy = async (policyId: string) => {
        try {
            setError("");
            setMessage("");
            await approvePolicy({
                id: policyId as Id<"policies">,
                approvedBy: "Admin"
            });
            setMessage("Policy approved and activated!");
        } catch (err) {
            setError(`Error approving policy: ${err}`);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            content: "",
            summary: "",
            category: "general_security",
            version: "1.0",
            requiresAcknowledgment: true,
            tags: ""
        });
    };

    const startEdit = (policy: any) => {
        setEditingPolicy(policy);
        setFormData({
            title: policy.title,
            content: policy.content,
            summary: policy.summary || "",
            category: policy.category,
            version: policy.version,
            requiresAcknowledgment: policy.requiresAcknowledgment,
            tags: policy.tags?.join(', ') || ""
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default">Active</Badge>;
            case 'draft':
                return <Badge variant="secondary">Draft</Badge>;
            case 'expired':
                return <Badge variant="destructive">Expired</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Policy Management
                    </CardTitle>
                    <div className="flex gap-2">
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setShowCreateDialog(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Policy
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                        <Button
                            variant="outline"
                            onClick={() => setShowPolicyManagement(!showPolicyManagement)}
                        >
                            {showPolicyManagement ? 'Hide' : 'Show'} Policies
                        </Button>
                    </div>
                </div>
                <CardDescription>
                    Create, edit, and manage company security policies
                </CardDescription>
            </CardHeader>

            {/* Create/Edit Policy Dialog */}
            <Dialog open={showCreateDialog || editingPolicy !== null} onOpenChange={(open) => {
                if (!open) {
                    setShowCreateDialog(false);
                    setEditingPolicy(null);
                    resetForm();
                }
            }}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPolicy ? 'Update the policy details below.' : 'Fill in the details to create a new security policy.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Policy Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., Password Security Policy"
                            />
                        </div>

                        <div>
                            <Label htmlFor="summary">Summary</Label>
                            <Input
                                id="summary"
                                value={formData.summary}
                                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                                placeholder="Brief description of the policy"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general_security">General Security</SelectItem>
                                        <SelectItem value="data_protection">Data Protection</SelectItem>
                                        <SelectItem value="pci_compliance">PCI Compliance</SelectItem>
                                        <SelectItem value="access_control">Access Control</SelectItem>
                                        <SelectItem value="incident_response">Incident Response</SelectItem>
                                        <SelectItem value="employee_conduct">Employee Conduct</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="version">Version</Label>
                                <Input
                                    id="version"
                                    value={formData.version}
                                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                                    placeholder="e.g., 1.0"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input
                                id="tags"
                                value={formData.tags}
                                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                                placeholder="e.g., security, compliance, password"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="requiresAcknowledgment"
                                checked={formData.requiresAcknowledgment}
                                onChange={(e) => setFormData(prev => ({ ...prev, requiresAcknowledgment: e.target.checked }))}
                            />
                            <Label htmlFor="requiresAcknowledgment">Requires Employee Acknowledgment</Label>
                        </div>

                        <div>
                            <Label htmlFor="content">Policy Content *</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Enter the detailed policy content..."
                                rows={8}
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => {
                                setShowCreateDialog(false);
                                setEditingPolicy(null);
                                resetForm();
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={editingPolicy ? handleUpdatePolicy : handleCreatePolicy}>
                                {editingPolicy ? 'Update Policy' : 'Create Policy'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {showPolicyManagement && (
                <CardContent className="space-y-4">
                    {allPolicies && allPolicies.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Version</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allPolicies.map((policy) => (
                                        <TableRow key={policy._id}>
                                            <TableCell className="font-medium">{policy.title}</TableCell>
                                            <TableCell>{policy.category}</TableCell>
                                            <TableCell>{policy.version}</TableCell>
                                            <TableCell>{getStatusBadge(policy.status)}</TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {new Date(policy.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => startEdit(policy)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    {policy.status === 'draft' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleApprovePolicy(policy._id)}
                                                        >
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeletePolicy(policy._id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No policies found.</p>
                            <p className="text-sm">Create your first policy to get started.</p>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

// Quiz Management Component
function QuizManagementSection({ error, message, setError, setMessage }: {
    error: string;
    message: string;
    setError: (error: string) => void;
    setMessage: (message: string) => void;
}) {
    const [showQuizManagement, setShowQuizManagement] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<any>(null);
    const [quizForm, setQuizForm] = useState({
        title: "",
        questions: [
            {
                questionText: "",
                options: ["", "", "", ""],
                correctAnswerIndex: 0
            }
        ]
    });

    // Queries and mutations for quiz management
    const allQuizzes = useQuery(api.quizzes.list);
    const createQuiz = useMutation(api.quizzes.create);
    const updateQuiz = useMutation(api.quizzes.update);
    const deleteQuiz = useMutation(api.quizzes.remove);
    const getQuizWithAnswers = useQuery(editingQuiz ? api.quizzes.getWithAnswers : "skip",
        editingQuiz ? { id: editingQuiz._id } : "skip");

    const handleCreateQuiz = async () => {
        if (!quizForm.title.trim()) {
            setError("Quiz title is required");
            return;
        }

        if (quizForm.questions.some(q => !q.questionText.trim() || q.options.some(opt => !opt.trim()))) {
            setError("All questions and options must be filled out");
            return;
        }

        try {
            setError("");
            setMessage("");
            await createQuiz({
                title: quizForm.title,
                questions: quizForm.questions
            });
            setMessage("Quiz created successfully!");
            setShowCreateDialog(false);
            resetQuizForm();
        } catch (err) {
            setError(`Error creating quiz: ${err}`);
        }
    };

    const handleUpdateQuiz = async () => {
        if (!editingQuiz || !quizForm.title.trim()) {
            setError("Quiz title is required");
            return;
        }

        if (quizForm.questions.some(q => !q.questionText.trim() || q.options.some(opt => !opt.trim()))) {
            setError("All questions and options must be filled out");
            return;
        }

        try {
            setError("");
            setMessage("");
            await updateQuiz({
                id: editingQuiz._id,
                title: quizForm.title,
                questions: quizForm.questions
            });
            setMessage("Quiz updated successfully!");
            setEditingQuiz(null);
            resetQuizForm();
        } catch (err) {
            setError(`Error updating quiz: ${err}`);
        }
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
            return;
        }

        try {
            setError("");
            setMessage("");
            await deleteQuiz({ id: quizId as Id<"quizzes"> });
            setMessage("Quiz deleted successfully!");
        } catch (err) {
            setError(`Error deleting quiz: ${err}`);
        }
    };

    const resetQuizForm = () => {
        setQuizForm({
            title: "",
            questions: [
                {
                    questionText: "",
                    options: ["", "", "", ""],
                    correctAnswerIndex: 0
                }
            ]
        });
    };

    const startEditQuiz = (quiz: any) => {
        setEditingQuiz(quiz);
        setQuizForm({
            title: quiz.title,
            questions: quiz.questions
        });
    };

    const addQuestion = () => {
        setQuizForm(prev => ({
            ...prev,
            questions: [...prev.questions, {
                questionText: "",
                options: ["", "", "", ""],
                correctAnswerIndex: 0
            }]
        }));
    };

    const removeQuestion = (index: number) => {
        if (quizForm.questions.length > 1) {
            setQuizForm(prev => ({
                ...prev,
                questions: prev.questions.filter((_, i) => i !== index)
            }));
        }
    };

    const updateQuestion = (questionIndex: number, field: string, value: any) => {
        setQuizForm(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) =>
                i === questionIndex ? { ...q, [field]: value } : q
            )
        }));
    };

    const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
        setQuizForm(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) =>
                i === questionIndex ? {
                    ...q,
                    options: q.options.map((opt, oi) => oi === optionIndex ? value : opt)
                } : q
            )
        }));
    };

    // Load quiz data when editing
    if (editingQuiz && getQuizWithAnswers && !quizForm.title && getQuizWithAnswers.title) {
        setQuizForm({
            title: getQuizWithAnswers.title,
            questions: getQuizWithAnswers.questions
        });
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Quiz Management
                    </CardTitle>
                    <div className="flex gap-2">
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setShowCreateDialog(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Quiz
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                        <Button
                            variant="outline"
                            onClick={() => setShowQuizManagement(!showQuizManagement)}
                        >
                            {showQuizManagement ? 'Hide' : 'Show'} Quizzes
                        </Button>
                    </div>
                </div>
                <CardDescription>
                    Create, edit, and manage security training quizzes
                </CardDescription>
            </CardHeader>

            {/* Create/Edit Quiz Dialog */}
            <Dialog open={showCreateDialog || editingQuiz !== null} onOpenChange={(open) => {
                if (!open) {
                    setShowCreateDialog(false);
                    setEditingQuiz(null);
                    resetQuizForm();
                }
            }}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingQuiz ? 'Update the quiz details below.' : 'Create a new security training quiz with multiple choice questions.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="quizTitle">Quiz Title *</Label>
                            <Input
                                id="quizTitle"
                                value={quizForm.title}
                                onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., Security Awareness Quiz - Module 1"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold">Questions</h4>
                                <Button type="button" variant="outline" onClick={addQuestion}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Question
                                </Button>
                            </div>

                            {quizForm.questions.map((question, qIndex) => (
                                <Card key={qIndex} className="p-4">
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <Label>Question {qIndex + 1}</Label>
                                            {quizForm.questions.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeQuestion(qIndex)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            )}
                                        </div>

                                        <Textarea
                                            value={question.questionText}
                                            onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                                            placeholder="Enter your question here..."
                                            rows={2}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {question.options.map((option, oIndex) => (
                                                <div key={oIndex} className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name={`correct-${qIndex}`}
                                                        checked={question.correctAnswerIndex === oIndex}
                                                        onChange={() => updateQuestion(qIndex, 'correctAnswerIndex', oIndex)}
                                                    />
                                                    <Input
                                                        value={option}
                                                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                        placeholder={`Option ${oIndex + 1}`}
                                                        className={question.correctAnswerIndex === oIndex ? 'border-green-500' : ''}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Select the correct answer by clicking the radio button next to it.
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => {
                                setShowCreateDialog(false);
                                setEditingQuiz(null);
                                resetQuizForm();
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={editingQuiz ? handleUpdateQuiz : handleCreateQuiz}>
                                {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {showQuizManagement && (
                <CardContent className="space-y-4">
                    {allQuizzes && allQuizzes.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Quiz Title</TableHead>
                                        <TableHead>Questions</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allQuizzes.map((quiz) => (
                                        <TableRow key={quiz._id}>
                                            <TableCell className="font-medium">{quiz.title}</TableCell>
                                            <TableCell>{quiz.questions.length} questions</TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {new Date(quiz._creationTime).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => startEditQuiz(quiz)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteQuiz(quiz._id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No quizzes found.</p>
                            <p className="text-sm">Create your first quiz to get started.</p>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

// FAQ Management Component
function FAQManagementSection({ error, message, setError, setMessage }: {
    error: string;
    message: string;
    setError: (error: string) => void;
    setMessage: (message: string) => void;
}) {
    const [showFAQManagement, setShowFAQManagement] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState<any>(null);
    const [faqForm, setFaqForm] = useState({
        question: "",
        answer: "",
        category: "security",
        tags: "",
        isActive: true,
        order: 1
    });

    // Queries and mutations for FAQ management
    const allFAQs = useQuery(api.faq.getAllFAQs);
    const createFAQ = useMutation(api.faq.createFAQ);
    const updateFAQ = useMutation(api.faq.updateFAQ);
    const deleteFAQ = useMutation(api.faq.deleteFAQ);

    const handleCreateFAQ = async () => {
        if (!faqForm.question.trim() || !faqForm.answer.trim()) {
            setError("Question and answer are required");
            return;
        }

        try {
            setError("");
            setMessage("");
            await createFAQ({
                question: faqForm.question,
                answer: faqForm.answer,
                category: faqForm.category,
                tags: faqForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                isActive: faqForm.isActive,
                order: faqForm.order,
                helpful: 0
            });
            setMessage("FAQ created successfully!");
            setShowCreateDialog(false);
            resetFAQForm();
        } catch (err) {
            setError(`Error creating FAQ: ${err}`);
        }
    };

    const handleUpdateFAQ = async () => {
        if (!editingFAQ || !faqForm.question.trim() || !faqForm.answer.trim()) {
            setError("Question and answer are required");
            return;
        }

        try {
            setError("");
            setMessage("");
            await updateFAQ({
                faqId: editingFAQ._id,
                updates: {
                    question: faqForm.question,
                    answer: faqForm.answer,
                    category: faqForm.category,
                    tags: faqForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                    isActive: faqForm.isActive,
                    order: faqForm.order,
                    helpful: editingFAQ.helpful || 0
                }
            });
            setMessage("FAQ updated successfully!");
            setEditingFAQ(null);
            resetFAQForm();
        } catch (err) {
            setError(`Error updating FAQ: ${err}`);
        }
    };

    const handleDeleteFAQ = async (faqId: string) => {
        if (!confirm("Are you sure you want to delete this FAQ? This action cannot be undone.")) {
            return;
        }

        try {
            setError("");
            setMessage("");
            await deleteFAQ({ faqId: faqId as Id<"faqs"> });
            setMessage("FAQ deleted successfully!");
        } catch (err) {
            setError(`Error deleting FAQ: ${err}`);
        }
    };

    const resetFAQForm = () => {
        setFaqForm({
            question: "",
            answer: "",
            category: "security",
            tags: "",
            isActive: true,
            order: 1
        });
    };

    const startEditFAQ = (faq: any) => {
        setEditingFAQ(faq);
        setFaqForm({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            tags: faq.tags?.join(', ') || "",
            isActive: faq.isActive,
            order: faq.order || 1
        });
    };

    const getCategoryBadge = (category: string) => {
        const variants: Record<string, string> = {
            'security': 'default',
            'training': 'secondary',
            'policies': 'outline',
            'technical': 'destructive',
            'general': 'secondary'
        };
        return variants[category] || 'outline';
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        FAQ Management
                    </CardTitle>
                    <div className="flex gap-2">
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setShowCreateDialog(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create FAQ
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                        <Button
                            variant="outline"
                            onClick={() => setShowFAQManagement(!showFAQManagement)}
                        >
                            {showFAQManagement ? 'Hide' : 'Show'} FAQs
                        </Button>
                    </div>
                </div>
                <CardDescription>
                    Create, edit, and manage frequently asked questions for user support
                </CardDescription>
            </CardHeader>

            {/* Create/Edit FAQ Dialog */}
            <Dialog open={showCreateDialog || editingFAQ !== null} onOpenChange={(open) => {
                if (!open) {
                    setShowCreateDialog(false);
                    setEditingFAQ(null);
                    resetFAQForm();
                }
            }}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingFAQ ? 'Edit FAQ' : 'Create New FAQ'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingFAQ ? 'Update the FAQ details below.' : 'Create a new frequently asked question for user support.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="faqQuestion">Question *</Label>
                            <Textarea
                                id="faqQuestion"
                                value={faqForm.question}
                                onChange={(e) => setFaqForm(prev => ({ ...prev, question: e.target.value }))}
                                placeholder="e.g., How do I reset my password?"
                                rows={2}
                            />
                        </div>

                        <div>
                            <Label htmlFor="faqAnswer">Answer *</Label>
                            <Textarea
                                id="faqAnswer"
                                value={faqForm.answer}
                                onChange={(e) => setFaqForm(prev => ({ ...prev, answer: e.target.value }))}
                                placeholder="Provide a detailed answer to the question..."
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="faqCategory">Category</Label>
                                <Select value={faqForm.category} onValueChange={(value) => setFaqForm(prev => ({ ...prev, category: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="security">Security</SelectItem>
                                        <SelectItem value="training">Training</SelectItem>
                                        <SelectItem value="policies">Policies</SelectItem>
                                        <SelectItem value="technical">Technical</SelectItem>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="account">Account</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="faqOrder">Display Order</Label>
                                <Input
                                    id="faqOrder"
                                    type="number"
                                    value={faqForm.order}
                                    onChange={(e) => setFaqForm(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                                    min="1"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="faqTags">Tags (comma-separated)</Label>
                            <Input
                                id="faqTags"
                                value={faqForm.tags}
                                onChange={(e) => setFaqForm(prev => ({ ...prev, tags: e.target.value }))}
                                placeholder="e.g., password, login, security"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="faqActive"
                                checked={faqForm.isActive}
                                onChange={(e) => setFaqForm(prev => ({ ...prev, isActive: e.target.checked }))}
                            />
                            <Label htmlFor="faqActive">Active (visible to users)</Label>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => {
                                setShowCreateDialog(false);
                                setEditingFAQ(null);
                                resetFAQForm();
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={editingFAQ ? handleUpdateFAQ : handleCreateFAQ}>
                                {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {showFAQManagement && (
                <CardContent className="space-y-4">
                    {allFAQs && allFAQs.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Question</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Helpful</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allFAQs.map((faq) => (
                                        <TableRow key={faq._id}>
                                            <TableCell className="font-medium max-w-xs">
                                                <div className="truncate" title={faq.question}>
                                                    {faq.question.length > 50 ?
                                                        faq.question.substring(0, 50) + "..." :
                                                        faq.question
                                                    }
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getCategoryBadge(faq.category) as any}>
                                                    {faq.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    {faq.helpful || 0}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={faq.isActive ? "default" : "secondary"}>
                                                    {faq.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{faq.order}</TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => startEditFAQ(faq)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteFAQ(faq._id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No FAQs found.</p>
                            <p className="text-sm">Create your first FAQ to get started.</p>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

// Certificate Management Component
function CertificateManagementSection({ error, message, setError, setMessage }: {
    error: string;
    message: string;
    setError: (error: string) => void;
    setMessage: (message: string) => void;
}) {
    const [showCertificateManagement, setShowCertificateManagement] = useState(false);
    const [showCreateTemplateDialog, setShowCreateTemplateDialog] = useState(false);
    const [showAwardDialog, setShowAwardDialog] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [templateForm, setTemplateForm] = useState({
        title: "",
        description: "",
        category: "security",
        certificateType: "completion",
        requiredModules: [] as string[],
        requiredQuizzes: [] as string[],
        minimumOverallScore: 70,
        validityPeriod: 365,
        complianceFramework: "",
        creditsAwarded: 1,
        autoAward: true
    });
    const [awardForm, setAwardForm] = useState({
        userId: "",
        templateId: "",
        issuedBy: "",
        notes: ""
    });

    // Queries and mutations for certificate management
    const allCertifications = useQuery(api.certifications.getAllCertifications);
    const allTemplates = useQuery(api.certifications.getAllCertificationTemplates);
    const allUsersForCerts = useQuery(api.users.listUsers); // For awarding certificates
    const allTrainingModules = useQuery(api.training.list); // For template creation
    const allQuizzesForCerts = useQuery(api.quizzes.list); // For template creation

    const createTemplate = useMutation(api.certifications.createCertificationTemplate);
    const awardCertificate = useMutation(api.certifications.awardCertification);
    const revokeCertificate = useMutation(api.certifications.revokeCertification);
    const renewCertificate = useMutation(api.certifications.renewCertification);

    const handleCreateTemplate = async () => {
        if (!templateForm.title.trim() || !templateForm.description.trim()) {
            setError("Title and description are required");
            return;
        }

        try {
            setError("");
            setMessage("");
            await createTemplate({
                title: templateForm.title,
                description: templateForm.description,
                category: templateForm.category,
                certificateType: templateForm.certificateType,
                requiredModules: templateForm.requiredModules as any[],
                requiredQuizzes: templateForm.requiredQuizzes as any[],
                minimumOverallScore: templateForm.minimumOverallScore,
                validityPeriod: templateForm.validityPeriod,
                complianceFramework: templateForm.complianceFramework ? templateForm.complianceFramework.split(',').map(f => f.trim()) : undefined,
                creditsAwarded: templateForm.creditsAwarded,
                autoAward: templateForm.autoAward
            });
            setMessage("Certificate template created successfully!");
            setShowCreateTemplateDialog(false);
            resetTemplateForm();
        } catch (err) {
            setError(`Error creating template: ${err}`);
        }
    };

    const handleAwardCertificate = async () => {
        if (!awardForm.userId || !awardForm.templateId) {
            setError("User and template are required");
            return;
        }

        try {
            setError("");
            setMessage("");
            await awardCertificate({
                userId: awardForm.userId,
                templateId: awardForm.templateId as Id<"certificationTemplates">,
                issuedBy: awardForm.issuedBy || "Admin",
                notes: awardForm.notes
            });
            setMessage("Certificate awarded successfully!");
            setShowAwardDialog(false);
            resetAwardForm();
        } catch (err) {
            setError(`Error awarding certificate: ${err}`);
        }
    };

    const handleRevokeCertificate = async (certId: string) => {
        const reason = prompt("Please enter the reason for revocation:");
        if (!reason) return;

        try {
            setError("");
            setMessage("");
            await revokeCertificate({
                certificationId: certId as Id<"certifications">,
                reason
            });
            setMessage("Certificate revoked successfully!");
        } catch (err) {
            setError(`Error revoking certificate: ${err}`);
        }
    };

    const handleRenewCertificate = async (certId: string) => {
        try {
            setError("");
            setMessage("");
            await renewCertificate({
                certificationId: certId as Id<"certifications">
            });
            setMessage("Certificate renewed successfully!");
        } catch (err) {
            setError(`Error renewing certificate: ${err}`);
        }
    };

    const resetTemplateForm = () => {
        setTemplateForm({
            title: "",
            description: "",
            category: "security",
            certificateType: "completion",
            requiredModules: [],
            requiredQuizzes: [],
            minimumOverallScore: 70,
            validityPeriod: 365,
            complianceFramework: "",
            creditsAwarded: 1,
            autoAward: true
        });
    };

    const resetAwardForm = () => {
        setAwardForm({
            userId: "",
            templateId: "",
            issuedBy: "",
            notes: ""
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            'active': 'default',
            'expired': 'secondary',
            'revoked': 'destructive',
            'earned': 'outline'
        };
        return variants[status] || 'outline';
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString();
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Certificate Management
                    </CardTitle>
                    <div className="flex gap-2">
                        <Dialog open={showCreateTemplateDialog} onOpenChange={setShowCreateTemplateDialog}>
                            <DialogTrigger asChild>
                                <Button variant="outline" onClick={() => setShowCreateTemplateDialog(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Template
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                        <Dialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setShowAwardDialog(true)}>
                                    <Award className="h-4 w-4 mr-2" />
                                    Award Certificate
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                        <Button
                            variant="outline"
                            onClick={() => setShowCertificateManagement(!showCertificateManagement)}
                        >
                            {showCertificateManagement ? 'Hide' : 'Show'} Certificates
                        </Button>
                    </div>
                </div>
                <CardDescription>
                    Manage certificate templates and award certificates to users
                </CardDescription>
            </CardHeader>

            {/* Create Template Dialog */}
            <Dialog open={showCreateTemplateDialog} onOpenChange={(open) => {
                if (!open) {
                    setShowCreateTemplateDialog(false);
                    setEditingTemplate(null);
                    resetTemplateForm();
                }
            }}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Certificate Template</DialogTitle>
                        <DialogDescription>
                            Define the requirements and properties for a new certificate type.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="templateTitle">Certificate Title *</Label>
                            <Input
                                id="templateTitle"
                                value={templateForm.title}
                                onChange={(e) => setTemplateForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., Security Awareness Certificate"
                            />
                        </div>

                        <div>
                            <Label htmlFor="templateDescription">Description *</Label>
                            <Textarea
                                id="templateDescription"
                                value={templateForm.description}
                                onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe what this certificate represents..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="templateCategory">Category</Label>
                                <Select value={templateForm.category} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, category: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="security">Security</SelectItem>
                                        <SelectItem value="compliance">Compliance</SelectItem>
                                        <SelectItem value="training">Training</SelectItem>
                                        <SelectItem value="technical">Technical</SelectItem>
                                        <SelectItem value="professional">Professional</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="certificateType">Certificate Type</Label>
                                <Select value={templateForm.certificateType} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, certificateType: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="completion">Completion</SelectItem>
                                        <SelectItem value="achievement">Achievement</SelectItem>
                                        <SelectItem value="proficiency">Proficiency</SelectItem>
                                        <SelectItem value="compliance">Compliance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="minScore">Minimum Score (%)</Label>
                                <Input
                                    id="minScore"
                                    type="number"
                                    value={templateForm.minimumOverallScore}
                                    onChange={(e) => setTemplateForm(prev => ({ ...prev, minimumOverallScore: parseInt(e.target.value) || 70 }))}
                                    min="0"
                                    max="100"
                                />
                            </div>

                            <div>
                                <Label htmlFor="validityPeriod">Validity (days)</Label>
                                <Input
                                    id="validityPeriod"
                                    type="number"
                                    value={templateForm.validityPeriod}
                                    onChange={(e) => setTemplateForm(prev => ({ ...prev, validityPeriod: parseInt(e.target.value) || 365 }))}
                                    min="1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="credits">Credits Awarded</Label>
                                <Input
                                    id="credits"
                                    type="number"
                                    value={templateForm.creditsAwarded}
                                    onChange={(e) => setTemplateForm(prev => ({ ...prev, creditsAwarded: parseInt(e.target.value) || 1 }))}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="complianceFramework">Compliance Framework (comma-separated)</Label>
                            <Input
                                id="complianceFramework"
                                value={templateForm.complianceFramework}
                                onChange={(e) => setTemplateForm(prev => ({ ...prev, complianceFramework: e.target.value }))}
                                placeholder="e.g., ISO 27001, SOX, PCI DSS"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="autoAward"
                                checked={templateForm.autoAward}
                                onChange={(e) => setTemplateForm(prev => ({ ...prev, autoAward: e.target.checked }))}
                            />
                            <Label htmlFor="autoAward">Auto-award when requirements are met</Label>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => {
                                setShowCreateTemplateDialog(false);
                                resetTemplateForm();
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateTemplate}>
                                Create Template
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Award Certificate Dialog */}
            <Dialog open={showAwardDialog} onOpenChange={(open) => {
                if (!open) {
                    setShowAwardDialog(false);
                    resetAwardForm();
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Award Certificate</DialogTitle>
                        <DialogDescription>
                            Award a certificate to a user based on an existing template.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="awardUser">Select User</Label>
                            <Select value={awardForm.userId} onValueChange={(value) => setAwardForm(prev => ({ ...prev, userId: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allUsersForCerts?.map((user) => (
                                        <SelectItem key={user._id} value={user.clerkId}>
                                            {user.email} ({user.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="awardTemplate">Certificate Template</Label>
                            <Select value={awardForm.templateId} onValueChange={(value) => setAwardForm(prev => ({ ...prev, templateId: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a template" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allTemplates?.map((template) => (
                                        <SelectItem key={template._id} value={template._id}>
                                            {template.title} ({template.category})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="issuedBy">Issued By</Label>
                            <Input
                                id="issuedBy"
                                value={awardForm.issuedBy}
                                onChange={(e) => setAwardForm(prev => ({ ...prev, issuedBy: e.target.value }))}
                                placeholder="e.g., Admin, Training Department"
                            />
                        </div>

                        <div>
                            <Label htmlFor="awardNotes">Notes (optional)</Label>
                            <Textarea
                                id="awardNotes"
                                value={awardForm.notes}
                                onChange={(e) => setAwardForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Any special notes about this certificate award..."
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => {
                                setShowAwardDialog(false);
                                resetAwardForm();
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={handleAwardCertificate}>
                                Award Certificate
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {showCertificateManagement && (
                <CardContent className="space-y-6">
                    {/* Certificate Templates Table */}
                    <div>
                        <h4 className="font-semibold mb-3">Certificate Templates</h4>
                        {allTemplates && allTemplates.length > 0 ? (
                            <div className="rounded-md border mb-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Template Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Min Score</TableHead>
                                            <TableHead>Validity</TableHead>
                                            <TableHead>Auto Award</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allTemplates.map((template) => (
                                            <TableRow key={template._id}>
                                                <TableCell className="font-medium">{template.title}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{template.category}</Badge>
                                                </TableCell>
                                                <TableCell>{template.certificateType}</TableCell>
                                                <TableCell>{template.minimumOverallScore}%</TableCell>
                                                <TableCell>{template.validityPeriod} days</TableCell>
                                                <TableCell>
                                                    <Badge variant={template.autoAward ? "default" : "secondary"}>
                                                        {template.autoAward ? "Yes" : "No"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500 mb-6">
                                <Award className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                <p>No templates found. Create your first template to get started.</p>
                            </div>
                        )}
                    </div>

                    {/* Issued Certificates Table */}
                    <div>
                        <h4 className="font-semibold mb-3">Issued Certificates</h4>
                        {allCertifications && allCertifications.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Certificate</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Issued</TableHead>
                                            <TableHead>Expires</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allCertifications.map((cert) => (
                                            <TableRow key={cert._id}>
                                                <TableCell className="font-medium">{cert.title}</TableCell>
                                                <TableCell>{cert.userId}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadge(cert.status) as any}>
                                                        {cert.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(cert.issuedAt)}</TableCell>
                                                <TableCell>
                                                    {cert.expiresAt ? formatDate(cert.expiresAt) : "Never"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-1">
                                                        {cert.status === "active" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRevokeCertificate(cert._id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-600" />
                                                            </Button>
                                                        )}
                                                        {(cert.status === "expired" || cert.status === "revoked") && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRenewCertificate(cert._id)}
                                                            >
                                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No certificates issued yet.</p>
                                <p className="text-sm">Award certificates to users to get started.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

export default function Dashboard() {
    const { role, isLoading: roleLoading } = useUserRole();
    const { user, isLoaded } = useUser();
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [showUserManagement, setShowUserManagement] = useState(false);

    // Convex queries and mutations for user management (only for admins)
    const currentUser = useQuery(api.users.getCurrentUser, role === "admin" ? {} : "skip");
    const allUsers = useQuery(api.users.listUsers, role === "admin" ? {} : "skip");
    const makeAdmin = useMutation(api.users.makeCurrentUserAdmin);
    const updateRole = useMutation(api.users.updateUserRole);

    const handleMakeAdmin = async () => {
        try {
            setError("");
            setMessage("");
            await makeAdmin();
            setMessage("Successfully made current user an admin!");
        } catch (err) {
            setError(`Error making admin: ${err}`);
        }
    };

    const handleUpdateRole = async () => {
        if (!selectedUserId || !selectedRole) {
            setError("Please select both a user and a role");
            return;
        }

        try {
            setError("");
            setMessage("");

            await updateRole({
                userId: selectedUserId as Id<"users">,
                newRole: selectedRole as any
            });

            setMessage(`Successfully updated user role to ${selectedRole}!`);
            setSelectedRole("");
            setSelectedUserId("");
        } catch (err) {
            setError(`Error updating role: ${err}`);
        }
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin':
                return 'destructive';
            case 'manager':
            case 'teacher':
                return 'default';
            case 'employee':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    if (roleLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (role === "admin") {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Welcome to the Royal Credit Recoveries Security Administration Panel</p>
                    </div>

                    {/* Admin Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-2">
                                    <Shield className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="text-2xl font-bold">24</p>
                                        <p className="text-xs text-muted-foreground">Active Policies</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-2">
                                    <BookOpen className="h-8 w-8 text-green-600" />
                                    <div>
                                        <p className="text-2xl font-bold">12</p>
                                        <p className="text-xs text-muted-foreground">Training Modules</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-2">
                                    <Award className="h-8 w-8 text-purple-600" />
                                    <div>
                                        <p className="text-2xl font-bold">156</p>
                                        <p className="text-xs text-muted-foreground">Certificates Issued</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-2">
                                    <Activity className="h-8 w-8 text-orange-600" />
                                    <div>
                                        <p className="text-2xl font-bold">89%</p>
                                        <p className="text-xs text-muted-foreground">Compliance Rate</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Messages */}
                    {error && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">{error}</AlertDescription>
                        </Alert>
                    )}

                    {message && (
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">{message}</AlertDescription>
                        </Alert>
                    )}

                    {/* User Management Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Advanced User Management
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowUserManagement(!showUserManagement)}
                                >
                                    {showUserManagement ? 'Hide' : 'Show'} Management Tools
                                </Button>
                            </div>
                            <CardDescription>
                                Direct database user management and role assignment tools
                            </CardDescription>
                        </CardHeader>
                        {showUserManagement && (
                            <CardContent className="space-y-6">
                                {/* Current User Info */}
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <h4 className="font-semibold mb-3">Current User Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p><strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress}</p>
                                            <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                                        </div>
                                        <div>
                                            <p><strong>Convex User:</strong> {currentUser ? "Found" : "Not Found"}</p>
                                            {currentUser && (
                                                <p><strong>Role:</strong> <Badge variant={getRoleBadgeVariant(currentUser.role)}>{currentUser.role}</Badge></p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Actions */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Make Admin */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Make Current User Admin</CardTitle>
                                            <CardDescription>
                                                Grant admin privileges to the current user
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Button
                                                onClick={handleMakeAdmin}
                                                className="w-full"
                                                disabled={currentUser?.role === 'admin'}
                                            >
                                                {currentUser?.role === 'admin' ? 'Already Admin' : 'Make Me Admin'}
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Update User Role */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Update User Role</CardTitle>
                                            <CardDescription>
                                                Change another user's role (requires admin)
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Select User:</label>
                                                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose a user" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {allUsers?.map((user) => (
                                                            <SelectItem key={user._id} value={user._id}>
                                                                {user.email} ({user.role})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">New Role:</label>
                                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose a role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="manager">Manager</SelectItem>
                                                        <SelectItem value="teacher">Teacher</SelectItem>
                                                        <SelectItem value="employee">Employee</SelectItem>
                                                        <SelectItem value="hr">HR</SelectItem>
                                                        <SelectItem value="security_officer">Security Officer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <Button
                                                onClick={handleUpdateRole}
                                                className="w-full"
                                                disabled={!selectedUserId || !selectedRole}
                                            >
                                                Update Role
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* All Users Table */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>All Users in System</CardTitle>
                                        <CardDescription>
                                            List of all users and their current roles
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {allUsers && allUsers.length > 0 ? (
                                            <div className="rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Email</TableHead>
                                                            <TableHead>Name</TableHead>
                                                            <TableHead>Role</TableHead>
                                                            <TableHead>Created</TableHead>
                                                            <TableHead>Updated</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {allUsers.map((user) => (
                                                            <TableRow key={user._id}>
                                                                <TableCell>{user.email}</TableCell>
                                                                <TableCell>
                                                                    {user.firstName && user.lastName
                                                                        ? `${user.firstName} ${user.lastName}`
                                                                        : 'No name'
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant={getRoleBadgeVariant(user.role)}>
                                                                        {user.role}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-sm text-gray-500">
                                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                                </TableCell>
                                                                <TableCell className="text-sm text-gray-500">
                                                                    {new Date(user.updatedAt).toLocaleDateString()}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                <p>No users found or you don't have permission to view them.</p>
                                                <p className="text-sm">Try making yourself an admin first.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </CardContent>
                        )}
                    </Card>

                    {/* Policy Management Section */}
                    <PolicyManagementSection
                        error={error}
                        message={message}
                        setError={setError}
                        setMessage={setMessage}
                    />

                    {/* Quiz Management Section */}
                    <QuizManagementSection
                        error={error}
                        message={message}
                        setError={setError}
                        setMessage={setMessage}
                    />

                    {/* FAQ Management Section */}
                    <FAQManagementSection
                        error={error}
                        message={message}
                        setError={setError}
                        setMessage={setMessage}
                    />

                    {/* Certificate Management Section */}
                    <CertificateManagementSection
                        error={error}
                        message={message}
                        setError={setError}
                        setMessage={setMessage}
                    />

                    {/* Admin Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <Link href="/admin/policies">
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <FileText className="h-6 w-6 text-blue-600" />
                                        <h3 className="font-semibold">Manage Policies</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Create, update, and track policy acknowledgments across the organization.
                                    </p>
                                </CardContent>
                            </Link>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <Link href="/admin/training">
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <BookOpen className="h-6 w-6 text-green-600" />
                                        <h3 className="font-semibold">Training Management</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Design training modules and monitor completion rates for all employees.
                                    </p>
                                </CardContent>
                            </Link>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <Link href="/admin/users">
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <Shield className="h-6 w-6 text-purple-600" />
                                        <h3 className="font-semibold">User Management</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Manage user roles, permissions, and access levels within the platform.
                                    </p>
                                </CardContent>
                            </Link>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <Link href="/admin/reports">
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <Activity className="h-6 w-6 text-orange-600" />
                                        <h3 className="font-semibold">Compliance Reports</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Generate detailed compliance reports and track organizational security metrics.
                                    </p>
                                </CardContent>
                            </Link>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <Link href="/admin/sample-data">
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <FileText className="h-6 w-6 text-cyan-600" />
                                        <h3 className="font-semibold">Sample Data</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Initialize the platform with sample policies, training modules, and test data.
                                    </p>
                                </CardContent>
                            </Link>
                        </Card>

                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <Link href="/admin/faq">
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <BookOpen className="h-6 w-6 text-indigo-600" />
                                        <h3 className="font-semibold">FAQ Management</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Manage frequently asked questions and help content for users.
                                    </p>
                                </CardContent>
                            </Link>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-4">Recent Administrative Activity</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <div>
                                        <p className="text-sm font-medium">New policy published: Data Protection Guidelines v2.1</p>
                                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                                    </div>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Published</span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <div>
                                        <p className="text-sm font-medium">Training module updated: PCI DSS Compliance</p>
                                        <p className="text-xs text-muted-foreground">5 hours ago</p>
                                    </div>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Updated</span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <div>
                                        <p className="text-sm font-medium">Compliance report generated for Q3 2025</p>
                                        <p className="text-xs text-muted-foreground">1 day ago</p>
                                    </div>
                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Generated</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Role-based dashboard for non-admin users
    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome to the Royal Credit Recoveries Security Platform - {role ? `${role.charAt(0).toUpperCase()}${role.slice(1)} Dashboard` : 'User Dashboard'}
                    </p>
                </div>

                {/* Role-specific Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <BookOpen className="h-8 w-8 text-green-600" />
                                <div>
                                    <p className="text-2xl font-bold">8</p>
                                    <p className="text-xs text-muted-foreground">Training Modules</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Award className="h-8 w-8 text-purple-600" />
                                <div>
                                    <p className="text-2xl font-bold">3</p>
                                    <p className="text-xs text-muted-foreground">Certificates Earned</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-8 w-8 text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold">12</p>
                                    <p className="text-xs text-muted-foreground">Policies Reviewed</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Activity className="h-8 w-8 text-orange-600" />
                                <div>
                                    <p className="text-2xl font-bold">92%</p>
                                    <p className="text-xs text-muted-foreground">Compliance Score</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Role-based Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <Link href="/training">
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-3 mb-3">
                                    <BookOpen className="h-6 w-6 text-green-600" />
                                    <h3 className="font-semibold">Security Training</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Complete security awareness training modules and stay up to date with best practices.
                                </p>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <Link href="/policies">
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-3 mb-3">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                    <h3 className="font-semibold">Company Policies</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Review security policies, procedures, and compliance requirements.
                                </p>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <Link href="/certifications">
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-3 mb-3">
                                    <Award className="h-6 w-6 text-purple-600" />
                                    <h3 className="font-semibold">My Certificates</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    View your earned certificates and track your training achievements.
                                </p>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <Link href="/progress-test">
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-3 mb-3">
                                    <Activity className="h-6 w-6 text-orange-600" />
                                    <h3 className="font-semibold">Progress Assessment</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Take assessments to test your security knowledge and track progress.
                                </p>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <Link href="/profile">
                            <CardContent className="pt-6">
                                <div className="flex items-center space-x-3 mb-3">
                                    <Shield className="h-6 w-6 text-cyan-600" />
                                    <h3 className="font-semibold">Account Security</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Manage your account security settings and enable two-factor authentication.
                                </p>
                            </CardContent>
                        </Link>
                    </Card>

                    {/* Role-specific actions */}
                    {(role === "manager" || role === "teacher") && (
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <Link href="/team-progress">
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <Shield className="h-6 w-6 text-indigo-600" />
                                        <h3 className="font-semibold">Team Overview</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Monitor your team's training progress and compliance status.
                                    </p>
                                </CardContent>
                            </Link>
                        </Card>
                    )}
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b pb-2">
                                <div>
                                    <p className="text-sm font-medium">Completed: Data Protection Training Module</p>
                                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                                </div>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completed</span>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <div>
                                    <p className="text-sm font-medium">Acknowledged: Password Policy v3.2</p>
                                    <p className="text-xs text-muted-foreground">1 day ago</p>
                                </div>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Acknowledged</span>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <div>
                                    <p className="text-sm font-medium">Earned: PCI DSS Compliance Certificate</p>
                                    <p className="text-xs text-muted-foreground">3 days ago</p>
                                </div>
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Earned</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}