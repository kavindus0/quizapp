"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    CheckCircle,
    Clock,
    BookOpen,
    Shield,
    AlertTriangle,
    Award,
    Filter,
    Brain,
    Target,
    TrendingUp
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import QuizModule from "@/components/QuizModule";

export const dynamic = 'force-dynamic';

export default function QuizzesPage() {
    const [takingQuiz, setTakingQuiz] = useState<Id<"quizzes"> | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const { user, isLoaded } = useUser();
    const quizzes = useQuery(api.quizzes.list);
    const quizResults = useQuery(api.quizzes.getMyQuizResults, {});
    const realtimeProgress = useQuery(api.realtimeProgress.getRealtimeProgress);

    const getQuizResult = (quizId: Id<"quizzes">) => {
        return quizResults?.find(result => result.quizId === quizId);
    };

    const getQuizCategory = (title: string) => {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('password')) return 'password_security';
        if (titleLower.includes('phishing')) return 'phishing';
        if (titleLower.includes('data') || titleLower.includes('privacy')) return 'data_protection';
        if (titleLower.includes('incident')) return 'incident_response';
        if (titleLower.includes('social engineering')) return 'social_engineering';
        if (titleLower.includes('mobile')) return 'mobile_security';
        if (titleLower.includes('physical')) return 'physical_security';
        if (titleLower.includes('compliance') || titleLower.includes('pci') || titleLower.includes('regulatory')) return 'compliance';
        if (titleLower.includes('remote work')) return 'remote_work';
        if (titleLower.includes('cyber') || titleLower.includes('fundamental')) return 'cybersecurity';
        return 'general_security';
    };

    const getDifficulty = (questions: any[]) => {
        const questionCount = questions?.length || 0;
        if (questionCount <= 2) return 'beginner';
        if (questionCount <= 3) return 'intermediate';
        return 'advanced';
    };

    const getCategoryDisplayName = (category: string) => {
        const categories: Record<string, string> = {
            "password_security": "Password Security",
            "phishing": "Phishing Awareness",
            "data_protection": "Data Protection",
            "incident_response": "Incident Response",
            "social_engineering": "Social Engineering",
            "mobile_security": "Mobile Security",
            "physical_security": "Physical Security",
            "compliance": "Compliance",
            "remote_work": "Remote Work",
            "cybersecurity": "Cybersecurity",
            "general_security": "General Security"
        };
        return categories[category] || category;
    };

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, any> = {
            "password_security": Shield,
            "phishing": AlertTriangle,
            "data_protection": Shield,
            "incident_response": Target,
            "social_engineering": Brain,
            "mobile_security": BookOpen,
            "physical_security": BookOpen,
            "compliance": Award,
            "remote_work": BookOpen,
            "cybersecurity": Shield,
            "general_security": BookOpen
        };
        return icons[category] || BookOpen;
    };

    const filteredQuizzes = quizzes?.filter(quiz => {
        const category = getQuizCategory(quiz.title);
        const difficulty = getDifficulty(quiz.questions);

        const categoryMatch = selectedCategory === "all" || category === selectedCategory;
        const difficultyMatch = selectedDifficulty === "all" || difficulty === selectedDifficulty;

        return categoryMatch && difficultyMatch;
    }) || [];

    const completedQuizzes = quizResults?.filter(result => result.percentage >= 70) || [];
    const totalQuizzes = quizzes?.length || 0;
    const completionRate = totalQuizzes > 0 ? Math.round((completedQuizzes.length / totalQuizzes) * 100) : 0;

    const handleTakeQuiz = (quizId: Id<"quizzes">) => {
        setTakingQuiz(quizId);
    };

    const handleCancelQuiz = () => {
        setTakingQuiz(null);
    };

    if (!isLoaded || !quizzes) {
        return <div>Loading...</div>;
    }

    // If user is not authenticated, show sign-in prompt
    if (!user) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <CardTitle>Sign In Required</CardTitle>
                            <CardDescription>
                                Please sign in to access quizzes and track your progress.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-sm text-muted-foreground mb-4">
                                You need to be authenticated to take quizzes and view your results.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // If taking a quiz, show the quiz component
    if (takingQuiz) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="outline" onClick={handleCancelQuiz} className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Quizzes</span>
                    </Button>
                </div>

                <QuizModule
                    moduleId={"" as Id<"trainingModules">} // Dummy module ID for standalone quizzes
                    quizId={takingQuiz}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center space-x-2">
                        <Brain className="h-8 w-8 text-blue-600" />
                        <span>Security Assessment Center</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Test your security knowledge with comprehensive quizzes covering all aspects of cybersecurity
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                        {completedQuizzes.length}/{totalQuizzes} Passed
                    </Badge>
                    <Badge variant={completionRate === 100 ? "default" : "secondary"}>
                        {completionRate}% Complete
                    </Badge>
                </div>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium">Total Quizzes</p>
                                <p className="text-2xl font-bold">{totalQuizzes}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                                <p className="text-sm font-medium">Passed</p>
                                <p className="text-2xl font-bold">{completedQuizzes.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <div>
                                <p className="text-sm font-medium">Completion Rate</p>
                                <p className="text-2xl font-bold">{completionRate}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4 text-yellow-600" />
                            <div>
                                <p className="text-sm font-medium">Average Score</p>
                                <p className="text-2xl font-bold">
                                    {quizResults && quizResults.length > 0
                                        ? Math.round(quizResults.reduce((sum, result) => sum + result.percentage, 0) / quizResults.length)
                                        : 0}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Filter className="h-5 w-5" />
                        <span>Filter Quizzes</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">Category</label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="password_security">Password Security</SelectItem>
                                    <SelectItem value="phishing">Phishing Awareness</SelectItem>
                                    <SelectItem value="data_protection">Data Protection</SelectItem>
                                    <SelectItem value="incident_response">Incident Response</SelectItem>
                                    <SelectItem value="social_engineering">Social Engineering</SelectItem>
                                    <SelectItem value="mobile_security">Mobile Security</SelectItem>
                                    <SelectItem value="physical_security">Physical Security</SelectItem>
                                    <SelectItem value="compliance">Compliance</SelectItem>
                                    <SelectItem value="remote_work">Remote Work</SelectItem>
                                    <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                                    <SelectItem value="general_security">General Security</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">Difficulty</label>
                            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="beginner">Beginner (1-2 questions)</SelectItem>
                                    <SelectItem value="intermediate">Intermediate (3 questions)</SelectItem>
                                    <SelectItem value="advanced">Advanced (4+ questions)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quizzes Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredQuizzes.map((quiz) => {
                    const category = getQuizCategory(quiz.title);
                    const difficulty = getDifficulty(quiz.questions);
                    const result = getQuizResult(quiz._id);
                    const CategoryIcon = getCategoryIcon(category);
                    const passed = result && result.percentage >= 70;

                    return (
                        <Card key={quiz._id} className={`relative ${passed ? 'border-l-4 border-l-green-500' : result ? 'border-l-4 border-l-orange-500' : ''}`}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-2">
                                        <CategoryIcon className="h-4 w-4 text-blue-500" />
                                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {passed && (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        )}
                                        {result && !passed && (
                                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                                        )}
                                    </div>
                                </div>
                                <CardDescription>
                                    Test your knowledge in {getCategoryDisplayName(category).toLowerCase()}
                                    with {quiz.questions.length} comprehensive questions
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Quiz metadata */}
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                        <CategoryIcon className="h-3 w-3" />
                                        <span>{getCategoryDisplayName(category)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{quiz.questions.length * 2} min</span>
                                    </div>
                                </div>

                                {/* Difficulty and question count */}
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="capitalize">
                                        {difficulty}
                                    </Badge>
                                    <Badge variant="secondary">
                                        {quiz.questions.length} Questions
                                    </Badge>
                                </div>

                                {/* Previous score if available */}
                                {result && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Best Score</span>
                                            <span className={passed ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'}>
                                                {result.percentage}%
                                            </span>
                                        </div>
                                        <Progress value={result.percentage} className="h-2" />
                                        <div className="text-xs text-gray-500">
                                            Last attempt: {new Date(result.completedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}

                                <Separator />

                                {/* Status and action */}
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center justify-between">
                                        {result ? (
                                            <Badge variant={passed ? "default" : "secondary"}>
                                                {passed ? "Passed" : "Needs Retake"}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">
                                                Not Attempted
                                            </Badge>
                                        )}
                                    </div>

                                    <Button
                                        onClick={() => handleTakeQuiz(quiz._id)}
                                        className="w-full"
                                        variant={result && passed ? "outline" : "default"}
                                    >
                                        {result && passed ? "Retake Quiz" : result ? "Retry Quiz" : "Start Quiz"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filteredQuizzes.length === 0 && (
                <Card>
                    <CardContent className="flex items-center justify-center h-32">
                        <p className="text-muted-foreground">No quizzes match the selected filters.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}