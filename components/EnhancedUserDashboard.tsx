"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    BookOpen,
    Award,
    FileText,
    Shield,
    CheckCircle,
    Clock,
    Target,
    HelpCircle,
    ChevronRight,
    Play,
    X,
    Lightbulb,
    TrendingUp,
    Calendar
} from "lucide-react";
import { useUserRole, useComplianceStatus } from "@/hooks/use-user-role";
import Link from "next/link";

export const dynamic = 'force-dynamic';

interface GuidedTourStep {
    id: string;
    title: string;
    description: string;
    target: string;
    action?: string;
}

const guidedTourSteps: GuidedTourStep[] = [
    {
        id: "welcome",
        title: "Welcome to Royal Credit Recoveries Security Platform",
        description: "This platform helps you stay secure and compliant with our company policies. Let's take a quick tour!",
        target: "dashboard",
    },
    {
        id: "progress",
        title: "Your Security Progress",
        description: "This shows your overall security training completion status. Green means you're on track!",
        target: "progress-card",
    },
    {
        id: "training",
        title: "Training Modules",
        description: "Complete these modules to learn about data protection, PCI compliance, and security best practices.",
        target: "training-section",
        action: "Start Training"
    },
    {
        id: "policies",
        title: "Company Policies",
        description: "Review and acknowledge our security policies. This is required for compliance.",
        target: "policies-section",
        action: "View Policies"
    },
    {
        id: "certificates",
        title: "Your Certificates",
        description: "Earn certificates by completing training modules. These show your security knowledge!",
        target: "certificates-section",
        action: "View Certificates"
    }
];

export default function EnhancedUserDashboard() {
    const { user } = useUser();
    const { role, isLoading: roleLoading } = useUserRole();
    const { isCompliant, has2FA, trainingComplete } = useComplianceStatus();

    const [showGuidedTour, setShowGuidedTour] = useState(false);
    const [currentTourStep, setCurrentTourStep] = useState(0);
    const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);

    // Fetch user data with real-time updates
    const realtimeProgress = useQuery(api.realtimeProgress.getRealtimeProgress);
    const userProgress = useQuery(api.progress.getUserProgress);
    const userCertifications = useQuery(
        api.certifications.getUserCertifications,
        user?.id ? { userId: user.id } : "skip"
    );
    const policies = useQuery(api.policies.list);
    const trainingModules = useQuery(api.training.list);
    const progressStats = useQuery(api.realtimeProgress.getProgressStats);

    // Check if this is user's first visit
    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome && user && !roleLoading) {
            setShowWelcomeDialog(true);
            localStorage.setItem('hasSeenWelcome', 'true');
        }
    }, [user, roleLoading]);

    const handleStartTour = () => {
        setShowWelcomeDialog(false);
        setShowGuidedTour(true);
        setCurrentTourStep(0);
    };

    const handleNextStep = () => {
        if (currentTourStep < guidedTourSteps.length - 1) {
            setCurrentTourStep(prev => prev + 1);
        } else {
            setShowGuidedTour(false);
            setCurrentTourStep(0);
        }
    };

    const handleSkipTour = () => {
        setShowGuidedTour(false);
        setShowWelcomeDialog(false);
        setCurrentTourStep(0);
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

    const completedModules = userProgress?.filter(p => p.completedAt > 0).length || 0;
    const totalModules = trainingModules?.length || 0;
    const progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

    const activeCertificates = userCertifications?.filter(c => c.status === "active").length || 0;
    const totalCertificates = userCertifications?.length || 0;

    // Calculate next actions for the user
    const getNextActions = () => {
        const actions = [];

        if (!has2FA) {
            actions.push({
                title: "Enable Two-Factor Authentication",
                description: "Secure your account with 2FA",
                icon: Shield,
                href: "/profile",
                priority: "high",
                color: "red"
            });
        }

        if (completedModules < totalModules) {
            actions.push({
                title: "Complete Training Modules",
                description: `${totalModules - completedModules} modules remaining`,
                icon: BookOpen,
                href: "/training",
                priority: "medium",
                color: "blue"
            });
        }

        if (policies?.some(p => p.requiresAcknowledgment)) {
            actions.push({
                title: "Review Company Policies",
                description: "Acknowledge required policies",
                icon: FileText,
                href: "/policies",
                priority: "medium",
                color: "yellow"
            });
        }

        return actions.slice(0, 3); // Show max 3 actions
    };

    const nextActions = getNextActions();

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Welcome Dialog */}
            <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Shield className="h-6 w-6 text-blue-600" />
                            <span>Welcome to Security Training!</span>
                        </DialogTitle>
                        <DialogDescription>
                            Hi {user?.firstName || 'there'}! This platform will help you stay secure and
                            compliant with Royal Credit Recoveries' security policies.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium">New to security training?</p>
                                    <p className="text-gray-600 mt-1">Take our guided tour to learn how to use this platform effectively.</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button onClick={handleStartTour} className="flex-1">
                                <Play className="h-4 w-4 mr-2" />
                                Start Guided Tour
                            </Button>
                            <Button variant="outline" onClick={() => setShowWelcomeDialog(false)}>
                                Skip
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Guided Tour Overlay */}
            {showGuidedTour && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">{guidedTourSteps[currentTourStep].title}</h3>
                                <p className="text-gray-600 mt-2">{guidedTourSteps[currentTourStep].description}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleSkipTour}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex space-x-1">
                                {guidedTourSteps.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-2 h-2 rounded-full ${index === currentTourStep ? 'bg-blue-600' : 'bg-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>

                            <div className="flex space-x-2">
                                <Button variant="outline" onClick={handleSkipTour}>
                                    Skip Tour
                                </Button>
                                <Button onClick={handleNextStep}>
                                    {currentTourStep === guidedTourSteps.length - 1 ? 'Finish' : 'Next'}
                                    {currentTourStep < guidedTourSteps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center space-x-3">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <span>Security Dashboard</span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {user?.firstName || 'Employee'}! Keep your security knowledge up to date.
                    </p>
                </div>
                <Button variant="outline" onClick={() => setShowGuidedTour(true)}>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help & Tour
                </Button>
            </div>

            {/* Compliance Status Alert */}
            {!isCompliant && (
                <Alert className="border-orange-200 bg-orange-50">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        Your security compliance needs attention. Please complete the recommended actions below.
                    </AlertDescription>
                </Alert>
            )}

            {/* Progress Overview */}
            <div id="progress-card">
                <Card className={`${showGuidedTour && guidedTourSteps[currentTourStep].target === 'progress-card' ? 'ring-4 ring-blue-500' : ''}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <span>Your Security Progress</span>
                        </CardTitle>
                        <CardDescription>Track your completion status across all security requirements</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="relative inline-flex items-center justify-center mb-4">
                                    <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center">
                                        <div className={`text-2xl font-bold ${progressPercentage >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                                            {Math.round(progressPercentage)}%
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm font-medium">Training Progress</p>
                                <p className="text-xs text-gray-500">{completedModules}/{totalModules} modules</p>
                            </div>

                            <div className="text-center">
                                <div className="relative inline-flex items-center justify-center mb-4">
                                    <Award className={`h-12 w-12 ${activeCertificates > 0 ? 'text-yellow-500' : 'text-gray-300'}`} />
                                </div>
                                <p className="text-sm font-medium">Active Certificates</p>
                                <p className="text-xs text-gray-500">{activeCertificates} earned</p>
                            </div>

                            <div className="text-center">
                                <div className="relative inline-flex items-center justify-center mb-4">
                                    <Shield className={`h-12 w-12 ${has2FA ? 'text-green-500' : 'text-red-500'}`} />
                                </div>
                                <p className="text-sm font-medium">Account Security</p>
                                <p className="text-xs text-gray-500">{has2FA ? '2FA Enabled' : '2FA Disabled'}</p>
                            </div>
                        </div>

                        {progressPercentage < 100 && (
                            <div className="mt-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Overall Progress</span>
                                    <span>{Math.round(progressPercentage)}%</span>
                                </div>
                                <Progress value={progressPercentage} className="h-2" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Next Actions */}
            {nextActions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Target className="h-5 w-5 text-blue-600" />
                            <span>Recommended Actions</span>
                        </CardTitle>
                        <CardDescription>Complete these tasks to improve your security compliance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {nextActions.map((action, index) => (
                                <Link key={index} href={action.href}>
                                    <div className={`flex items-center justify-between p-4 rounded-lg border-2 hover:bg-gray-50 cursor-pointer transition-colors ${action.priority === 'high' ? 'border-red-200 bg-red-50' :
                                        action.priority === 'medium' ? 'border-blue-200 bg-blue-50' :
                                            'border-gray-200'
                                        }`}>
                                        <div className="flex items-center space-x-3">
                                            <action.icon className={`h-5 w-5 ${action.color === 'red' ? 'text-red-600' :
                                                action.color === 'blue' ? 'text-blue-600' :
                                                    action.color === 'yellow' ? 'text-yellow-600' :
                                                        'text-gray-600'
                                                }`} />
                                            <div>
                                                <p className="font-medium">{action.title}</p>
                                                <p className="text-sm text-gray-600">{action.description}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Access Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Training Section */}
                <div id="training-section" className={`${showGuidedTour && guidedTourSteps[currentTourStep].target === 'training-section' ? 'ring-4 ring-blue-500' : ''}`}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                <span>Training Modules</span>
                            </CardTitle>
                            <CardDescription>Learn about security best practices</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Completed Modules</span>
                                    <Badge variant={completedModules === totalModules ? "default" : "secondary"}>
                                        {completedModules}/{totalModules}
                                    </Badge>
                                </div>
                                <Progress value={progressPercentage} className="h-2" />
                                <Link href="/training">
                                    <Button className="w-full">
                                        {completedModules < totalModules ? 'Continue Training' : 'Review Training'}
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Policies Section */}
                <div id="policies-section" className={`${showGuidedTour && guidedTourSteps[currentTourStep].target === 'policies-section' ? 'ring-4 ring-blue-500' : ''}`}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-green-600" />
                                <span>Company Policies</span>
                            </CardTitle>
                            <CardDescription>Review security policies and procedures</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Available Policies</span>
                                    <Badge variant="outline">{policies?.length || 0}</Badge>
                                </div>
                                <div className="text-xs text-gray-600">
                                    Stay compliant by reviewing our security policies
                                </div>
                                <Link href="/policies">
                                    <Button variant="outline" className="w-full">
                                        View Policies
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Certificates Section */}
                <div id="certificates-section" className={`${showGuidedTour && guidedTourSteps[currentTourStep].target === 'certificates-section' ? 'ring-4 ring-blue-500' : ''}`}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Award className="h-5 w-5 text-yellow-600" />
                                <span>Certificates</span>
                            </CardTitle>
                            <CardDescription>Track your security certifications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Active Certificates</span>
                                    <Badge variant={activeCertificates > 0 ? "default" : "secondary"}>
                                        {activeCertificates}
                                    </Badge>
                                </div>
                                <div className="text-xs text-gray-600">
                                    Earn certificates by completing training modules
                                </div>
                                <Link href="/certifications">
                                    <Button variant="outline" className="w-full">
                                        View Certificates
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        <span>Recent Activity</span>
                    </CardTitle>
                    <CardDescription>Your latest security training activities</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {userProgress?.slice(0, 3).map((progress, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <div>
                                        <p className="text-sm font-medium">Training module completed</p>
                                        <p className="text-xs text-gray-500">
                                            {progress.completedAt > 0 ? new Date(progress.completedAt).toLocaleDateString() : 'In progress'}
                                        </p>
                                    </div>
                                </div>
                                {progress.quizScore && (
                                    <Badge variant="outline">
                                        {Math.round((progress.quizScore || 0) * 100)}%
                                    </Badge>
                                )}
                            </div>
                        ))}
                        {(!userProgress || userProgress.length === 0) && (
                            <div className="text-center text-gray-500 py-6">
                                <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p>No activity yet. Start your security training!</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}