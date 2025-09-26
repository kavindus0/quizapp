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
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export const dynamic = 'force-dynamic';

interface Quiz {
    _id: Id<"quizzes">;
    title: string;
    questions: Question[];
}

interface Question {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
}export default function AdminQuizzesPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        questions: [] as Question[]
    });
    const [currentQuestion, setCurrentQuestion] = useState({
        questionText: "",
        options: ["", "", "", ""],
        correctAnswerIndex: 0
    });

    const quizzes = useQuery(api.quizzes.list);
    const createQuiz = useMutation(api.quizzes.create);
    const updateQuiz = useMutation(api.quizzes.update);
    const removeQuiz = useMutation(api.quizzes.remove);

    const resetForm = () => {
        setFormData({
            title: "",
            questions: []
        });
        setCurrentQuestion({
            questionText: "",
            options: ["", "", "", ""],
            correctAnswerIndex: 0
        });
    };

    const addQuestion = () => {
        if (!currentQuestion.questionText.trim() || currentQuestion.options.some(opt => !opt.trim())) {
            alert("Please fill in the question and all options");
            return;
        }

        setFormData({
            ...formData,
            questions: [...formData.questions, { ...currentQuestion }]
        });
        setCurrentQuestion({
            questionText: "",
            options: ["", "", "", ""],
            correctAnswerIndex: 0
        });
    };

    const removeQuestion = (index: number) => {
        setFormData({
            ...formData,
            questions: formData.questions.filter((_, i) => i !== index)
        });
    };

    const handleCreate = async () => {
        if (!formData.title.trim() || formData.questions.length === 0) {
            alert("Please fill in all required fields and add at least one question");
            return;
        }

        try {
            await createQuiz({
                title: formData.title,
                questions: formData.questions
            });
            resetForm();
            setIsCreateDialogOpen(false);
            alert("Quiz created successfully");
        } catch (error) {
            console.error("Failed to create quiz:", error);
            alert("Failed to create quiz");
        }
    };

    const handleUpdate = async () => {
        if (!editingQuiz || !formData.title.trim() || formData.questions.length === 0) {
            alert("Please fill in all required fields and add at least one question");
            return;
        }

        try {
            await updateQuiz({
                id: editingQuiz._id,
                title: formData.title,
                questions: formData.questions
            });
            setEditingQuiz(null);
            resetForm();
            alert("Quiz updated successfully");
        } catch (error) {
            console.error("Failed to update quiz:", error);
            alert("Failed to update quiz");
        }
    };

    const handleDelete = async (id: Id<"quizzes">) => {
        if (!confirm("Are you sure you want to delete this quiz?")) return;
        try {
            await removeQuiz({ id });
            alert("Quiz deleted successfully");
        } catch (error) {
            console.error("Failed to delete quiz:", error);
            alert("Failed to delete quiz");
        }
    };

    const openEditDialog = (quiz: Quiz) => {
        setEditingQuiz(quiz);
        setFormData({
            title: quiz.title,
            questions: quiz.questions
        });
    };

    if (!quizzes) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Quiz Management</h1>
                    <p className="text-muted-foreground">
                        Create and manage quizzes for training modules
                    </p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Quiz
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Quiz</DialogTitle>
                            <DialogDescription>
                                Create a quiz with questions and answers for training assessment.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                            {/* Quiz Details */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Quiz Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter quiz title"
                                    />
                                </div>
                            </div>

                            {/* Questions Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Questions</h3>

                                {/* Add Question Form */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Add Question</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label>Question</Label>
                                            <Textarea
                                                value={currentQuestion.questionText}
                                                onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                                                placeholder="Enter your question"
                                                rows={2}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {currentQuestion.options.map((option, index) => (
                                                <div key={index}>
                                                    <Label>Option {index + 1} {index === currentQuestion.correctAnswerIndex && "(Correct)"}</Label>
                                                    <Input
                                                        value={option}
                                                        onChange={(e) => {
                                                            const newOptions = [...currentQuestion.options];
                                                            newOptions[index] = e.target.value;
                                                            setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                                        }}
                                                        placeholder={`Option ${index + 1}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <Label>Correct Answer</Label>
                                            <Select
                                                value={currentQuestion.correctAnswerIndex.toString()}
                                                onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, correctAnswerIndex: parseInt(value) })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {currentQuestion.options.map((_, index) => (
                                                        <SelectItem key={index} value={index.toString()}>
                                                            Option {index + 1}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button onClick={addQuestion} className="w-full">
                                            Add Question
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Questions List */}
                                {formData.questions.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Added Questions ({formData.questions.length})</h4>
                                        {formData.questions.map((q, index) => (
                                            <Card key={index}>
                                                <CardContent className="pt-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="font-medium">{q.questionText}</p>
                                                            <div className="mt-2 space-y-1">
                                                                {q.options.map((option, optIndex) => (
                                                                    <div key={optIndex} className="flex items-center space-x-2">
                                                                        <span className={`text-sm ${optIndex === q.correctAnswerIndex ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                                                                            {optIndex + 1}. {option}
                                                                            {optIndex === q.correctAnswerIndex && " ✓"}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeQuestion(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={formData.questions.length === 0}>
                                Create Quiz
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quizzes</CardTitle>
                    <CardDescription>
                        Manage all quizzes in your organization
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {quizzes.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No quizzes created yet.</p>
                            <Button
                                className="mt-4"
                                onClick={() => setIsCreateDialogOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Quiz
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Questions</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quizzes.map((quiz) => (
                                    <TableRow key={quiz._id}>
                                        <TableCell className="font-medium">{quiz.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{quiz.questions.length} questions</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditDialog(quiz)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(quiz._id)}
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
            <Dialog open={!!editingQuiz} onOpenChange={() => setEditingQuiz(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Quiz</DialogTitle>
                        <DialogDescription>
                            Update the quiz details and questions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        {/* Quiz Details */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-title">Quiz Title</Label>
                                <Input
                                    id="edit-title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter quiz title"
                                />
                            </div>
                        </div>

                        {/* Questions Display */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Questions ({formData.questions.length})</h3>
                            {formData.questions.map((q, index) => (
                                <Card key={index}>
                                    <CardContent className="pt-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-medium">{q.questionText}</p>
                                                <div className="mt-2 space-y-1">
                                                    {q.options.map((option, optIndex) => (
                                                        <div key={optIndex} className="flex items-center space-x-2">
                                                            <span className={`text-sm ${optIndex === q.correctAnswerIndex ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                                                                {optIndex + 1}. {option}
                                                                {optIndex === q.correctAnswerIndex && " ✓"}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeQuestion(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingQuiz(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={formData.questions.length === 0}>
                            Update Quiz
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}