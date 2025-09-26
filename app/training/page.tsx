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
    Play,
    FileText,
    CheckCircle,
    Clock,
    Monitor,
    BookOpen,
    Shield,
    AlertTriangle,
    Award,
    Filter
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import QuizModule from "@/components/QuizModule";
import VideoPlayer from "@/components/VideoPlayer";

export const dynamic = 'force-dynamic';

export default function TrainingPage() {
    const [takingQuiz, setTakingQuiz] = useState<Id<"quizzes"> | null>(null);
    const [currentModuleId, setCurrentModuleId] = useState<Id<"trainingModules"> | null>(null);
    const [viewingModule, setViewingModule] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

    const { user, isLoaded } = useUser();
    const modules = useQuery(api.training.list);
    const quizzes = useQuery(api.quizzes.list);
    const userProgress = useQuery(api.progress.getUserProgress);

    const getModuleProgress = (moduleId: string) => {
        return userProgress?.find(p => p.moduleId === moduleId);
    };

    const getProgressStatus = (moduleId: string) => {
        const progress = getModuleProgress(moduleId);
        if (!progress) return { status: "not-started", percentage: 0 };
        if (progress.completedAt > 0) return { status: "completed", percentage: 100 };
        return { status: "in-progress", percentage: 50 }; // Simplified - could be more sophisticated
    };

    const getCategoryDisplayName = (category: string) => {
        const categories: Record<string, string> = {
            "data_protection": "Data Protection",
            "pci_compliance": "PCI DSS Compliance",
            "call_security": "Call Security",
            "fraud_prevention": "Fraud Prevention",
            "general_security": "General Security",
            "incident_response": "Incident Response",
            "compliance": "Compliance"
        };
        return categories[category] || category;
    };

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, any> = {
            "data_protection": Shield,
            "pci_compliance": Award,
            "call_security": Monitor,
            "fraud_prevention": AlertTriangle,
            "general_security": BookOpen,
            "incident_response": FileText,
            "compliance": CheckCircle
        };
        return icons[category] || BookOpen;
    };

    const getTypeIcon = (type: string) => {
        const icons: Record<string, any> = {
            "video": Play,
            "document": FileText,
            "interactive": Monitor,
            "simulation": AlertTriangle,
            "assessment": CheckCircle
        };
        return icons[type] || FileText;
    };

    const filteredModules = modules?.filter(module => {
        const categoryMatch = selectedCategory === "all" || module.category === selectedCategory;
        const difficultyMatch = selectedDifficulty === "all" || module.difficulty === selectedDifficulty;
        return categoryMatch && difficultyMatch;
    }) || [];

    const requiredModules = modules?.filter(module => module.isRequired) || [];
    const optionalModules = modules?.filter(module => !module.isRequired) || [];
    const completedCount = userProgress?.filter(p => p.completedAt > 0).length || 0;

    const handleTakeQuiz = (quizId: Id<"quizzes">, moduleId: Id<"trainingModules">) => {
        setTakingQuiz(quizId);
        setCurrentModuleId(moduleId);
    };

    const handleQuizComplete = (score: number, passed: boolean) => {
        alert(`Quiz completed! Score: ${score}% - ${passed ? 'Passed' : 'Failed'}`);
        setTakingQuiz(null);
        setCurrentModuleId(null);
    };

    const handleCancelQuiz = () => {
        setTakingQuiz(null);
        setCurrentModuleId(null);
    };

    const handleViewModule = (module: any) => {
        setViewingModule(module);
    };

    const handleCloseModule = () => {
        setViewingModule(null);
    };

    if (!isLoaded || !modules || !quizzes) {
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
                                Please sign in to access your training modules and track your progress.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-sm text-muted-foreground mb-4">
                                You need to be authenticated to view training content and track your completion progress.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // If userProgress query hasn't loaded yet
    if (!userProgress) {
        return <div>Loading progress...</div>;
    }

    // If viewing a module, show the module details with embedded video
    if (viewingModule) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="outline" onClick={handleCloseModule} className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Training</span>
                    </Button>
                    {viewingModule.isRequired && (
                        <Badge variant="destructive">Required Training</Badge>
                    )}
                </div>

                {viewingModule.type === "video" ? (
                    <VideoPlayer
                        contentUrl={viewingModule.contentUrl}
                        title={viewingModule.title}
                        description={viewingModule.description}
                    />
                ) : (
                    <Card className="p-6">
                        <CardHeader>
                            <CardTitle>{viewingModule.title}</CardTitle>
                            <CardDescription>{viewingModule.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">This training module contains external content.</p>
                            <Button
                                onClick={() => window.open(viewingModule.contentUrl, "_blank")}
                                className="flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <span>Open Content</span>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Module Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Training Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium mb-2">Details</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Category:</span>
                                    <Badge variant="outline">{viewingModule.category}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Difficulty:</span>
                                    <Badge variant="outline" className="capitalize">{viewingModule.difficulty}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Duration:</span>
                                    <span>{viewingModule.estimatedDuration} minutes</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Type:</span>
                                    <Badge variant="outline" className="capitalize">{viewingModule.type}</Badge>
                                </div>
                            </div>
                        </div>

                        {viewingModule.learningObjectives && viewingModule.learningObjectives.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2">Learning Objectives</h4>
                                <ul className="text-sm space-y-1 list-disc list-inside">
                                    {viewingModule.learningObjectives.map((objective: string, index: number) => (
                                        <li key={index}>{objective}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quiz Button */}
                {viewingModule.quizId && (
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center">
                                <h3 className="text-lg font-medium mb-2">Complete Your Assessment</h3>
                                <p className="text-gray-600 mb-4">
                                    Test your knowledge with the associated quiz to complete this training module.
                                </p>
                                <Button
                                    onClick={() => handleTakeQuiz(viewingModule.quizId!, viewingModule._id)}
                                    className="flex items-center space-x-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Take Assessment Quiz</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    // If taking a quiz, show the quiz component
    if (takingQuiz && currentModuleId) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="outline" onClick={handleCancelQuiz} className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Training</span>
                    </Button>
                </div>

                <QuizModule
                    moduleId={currentModuleId}
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
                        <Shield className="h-8 w-8 text-blue-600" />
                        <span>Security Training</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Complete your security awareness training for Royal Credit Recoveries
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                        {completedCount}/{modules?.length || 0} Completed
                    </Badge>
                    <Badge variant={completedCount === modules?.length ? "default" : "secondary"}>
                        {modules?.length === completedCount ? "All Complete" : "In Progress"}
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
                                <p className="text-sm font-medium">Total Modules</p>
                                <p className="text-2xl font-bold">{modules?.length || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <div>
                                <p className="text-sm font-medium">Required</p>
                                <p className="text-2xl font-bold">{requiredModules.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                                <p className="text-sm font-medium">Completed</p>
                                <p className="text-2xl font-bold">{completedCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-purple-600" />
                            <div>
                                <p className="text-sm font-medium">Progress</p>
                                <p className="text-2xl font-bold">{Math.round((completedCount / Math.max(modules?.length || 1, 1)) * 100)}%</p>
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
                        <span>Filter Training Modules</span>
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
                                    <SelectItem value="data_protection">Data Protection</SelectItem>
                                    <SelectItem value="pci_compliance">PCI DSS Compliance</SelectItem>
                                    <SelectItem value="call_security">Call Security</SelectItem>
                                    <SelectItem value="fraud_prevention">Fraud Prevention</SelectItem>
                                    <SelectItem value="general_security">General Security</SelectItem>
                                    <SelectItem value="incident_response">Incident Response</SelectItem>
                                    <SelectItem value="compliance">Compliance</SelectItem>
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
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Training Modules */}
            <Tabs defaultValue="required" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="required">Required Training</TabsTrigger>
                    <TabsTrigger value="optional">Optional Training</TabsTrigger>
                    <TabsTrigger value="all">All Modules</TabsTrigger>
                </TabsList>

                <TabsContent value="required" className="space-y-4">
                    {requiredModules.length === 0 ? (
                        <Card>
                            <CardContent className="flex items-center justify-center h-32">
                                <p className="text-muted-foreground">No required training modules available.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {requiredModules.filter(module => {
                                const categoryMatch = selectedCategory === "all" || module.category === selectedCategory;
                                const difficultyMatch = selectedDifficulty === "all" || module.difficulty === selectedDifficulty;
                                return categoryMatch && difficultyMatch;
                            }).map((module) => (
                                <ModuleCard
                                    key={module._id}
                                    module={module}
                                    progress={getProgressStatus(module._id)}
                                    moduleProgress={getModuleProgress(module._id)}
                                    onTakeQuiz={handleTakeQuiz}
                                    onViewModule={handleViewModule}
                                    getCategoryDisplayName={getCategoryDisplayName}
                                    getCategoryIcon={getCategoryIcon}
                                    getTypeIcon={getTypeIcon}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="optional" className="space-y-4">
                    {optionalModules.length === 0 ? (
                        <Card>
                            <CardContent className="flex items-center justify-center h-32">
                                <p className="text-muted-foreground">No optional training modules available.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {optionalModules.filter(module => {
                                const categoryMatch = selectedCategory === "all" || module.category === selectedCategory;
                                const difficultyMatch = selectedDifficulty === "all" || module.difficulty === selectedDifficulty;
                                return categoryMatch && difficultyMatch;
                            }).map((module) => (
                                <ModuleCard
                                    key={module._id}
                                    module={module}
                                    progress={getProgressStatus(module._id)}
                                    moduleProgress={getModuleProgress(module._id)}
                                    onTakeQuiz={handleTakeQuiz}
                                    onViewModule={handleViewModule}
                                    getCategoryDisplayName={getCategoryDisplayName}
                                    getCategoryIcon={getCategoryIcon}
                                    getTypeIcon={getTypeIcon}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                    {filteredModules.length === 0 ? (
                        <Card>
                            <CardContent className="flex items-center justify-center h-32">
                                <p className="text-muted-foreground">No training modules match the selected filters.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredModules.map((module) => (
                                <ModuleCard
                                    key={module._id}
                                    module={module}
                                    progress={getProgressStatus(module._id)}
                                    moduleProgress={getModuleProgress(module._id)}
                                    onTakeQuiz={handleTakeQuiz}
                                    onViewModule={handleViewModule}
                                    getCategoryDisplayName={getCategoryDisplayName}
                                    getCategoryIcon={getCategoryIcon}
                                    getTypeIcon={getTypeIcon}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Module Card Component
interface ModuleCardProps {
    module: any;
    progress: { status: string; percentage: number };
    moduleProgress: any;
    onTakeQuiz: (quizId: Id<"quizzes">, moduleId: Id<"trainingModules">) => void;
    onViewModule: (module: any) => void;
    getCategoryDisplayName: (category: string) => string;
    getCategoryIcon: (category: string) => any;
    getTypeIcon: (type: string) => any;
}

function ModuleCard({
    module,
    progress,
    moduleProgress,
    onTakeQuiz,
    onViewModule,
    getCategoryDisplayName,
    getCategoryIcon,
    getTypeIcon
}: ModuleCardProps) {
    const TypeIcon = getTypeIcon(module.type);
    const CategoryIcon = getCategoryIcon(module.category);

    return (
        <Card className={`relative ${module.isRequired ? 'border-l-4 border-l-red-500' : ''}`}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                        <TypeIcon className="h-4 w-4 text-blue-500" />
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                        {module.isRequired && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                        {progress.status === "completed" && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                    </div>
                </div>
                <CardDescription>{module.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Module metadata */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                        <CategoryIcon className="h-3 w-3" />
                        <span>{getCategoryDisplayName(module.category || "general_security")}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{module.estimatedDuration || 30}min</span>
                    </div>
                </div>

                {/* Difficulty badge */}
                <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                        {module.difficulty || "beginner"}
                    </Badge>
                    {module.complianceFramework && module.complianceFramework.length > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Shield className="h-3 w-3" />
                            <span>{module.complianceFramework[0]}</span>
                        </div>
                    )}
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress.percentage}%</span>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                </div>

                {/* Quiz score if available */}
                {moduleProgress?.quizScore !== undefined && (
                    <div className="text-sm text-muted-foreground">
                        Quiz Score: {moduleProgress.quizScore}%
                        {module.passScore && (
                            <span className={`ml-2 ${moduleProgress.quizScore >= module.passScore ? 'text-green-600' : 'text-red-600'}`}>
                                ({moduleProgress.quizScore >= module.passScore ? 'Passed' : `Need ${module.passScore}% to pass`})
                            </span>
                        )}
                    </div>
                )}

                <Separator />

                {/* Learning objectives preview */}
                {module.learningObjectives && module.learningObjectives.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                        <p className="font-medium mb-1">Learning Objectives:</p>
                        <ul className="list-disc list-inside space-y-1">
                            {module.learningObjectives.slice(0, 2).map((objective: string, index: number) => (
                                <li key={index} className="truncate">{objective}</li>
                            ))}
                            {module.learningObjectives.length > 2 && (
                                <li>+ {module.learningObjectives.length - 2} more...</li>
                            )}
                        </ul>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                        <Badge variant={progress.status === "completed" ? "default" : "secondary"}>
                            {progress.status === "completed" ? "Completed" :
                                progress.status === "in-progress" ? "In Progress" : "Not Started"}
                        </Badge>
                        <Button
                            size="sm"
                            onClick={() => {
                                if (module.type === "video") {
                                    onViewModule(module);
                                } else if (module.type === "interactive" || module.type === "simulation") {
                                    // For interactive content, could open in modal or navigate to dedicated page
                                    window.open(module.contentUrl, "_blank");
                                } else {
                                    window.open(module.contentUrl, "_blank");
                                }
                            }}
                        >
                            {module.type === "video" ? "Watch Video" :
                                module.type === "interactive" ? "Start Training" :
                                    module.type === "simulation" ? "Run Simulation" :
                                        "View Content"}
                        </Button>
                    </div>

                    {module.quizId && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => onTakeQuiz(module.quizId!, module._id)}
                        >
                            Take Quiz
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}