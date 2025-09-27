"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProgressAnalytics from "@/components/analytics/ProgressCharts";
import {
    CheckCircle,
    Clock,
    BookOpen,
    TrendingUp,
    Target,
    BarChart3,
    PieChart,
    Activity,
    Award,
    Users,
    Zap
} from "lucide-react";

export default function ProgressTestPage() {
    const { user, isLoaded } = useUser();
    const realtimeProgress = useQuery(api.realtimeProgress.getRealtimeProgress);
    const progressStats = useQuery(api.realtimeProgress.getProgressStats);
    const analyticsData = useQuery(api.analytics.getUserQuizAnalytics);
    const performanceTrends = useQuery(api.analytics.getQuizPerformanceTrends, { timeframe: "month" });
    const moduleAnalytics = useQuery(api.analytics.getModuleCompletionAnalytics);
    const comparativeData = useQuery(api.analytics.getComparativePerformance);

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>Please sign in to view your progress.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Real-time Progress Dashboard</h1>
                <p className="text-gray-600">Live tracking of your training progress and quiz completions</p>
            </div>

            {/* Progress Statistics */}
            {progressStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Target className="h-4 w-4 text-blue-600" />
                                Total Modules
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{progressStats.totalModules}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                Completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{progressStats.completedModules}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-600" />
                                In Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{progressStats.totalModules - progressStats.completedModules}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-purple-600" />
                                Completion Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">
                                {Math.round((progressStats.completedModules / progressStats.totalModules) * 100)}%
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Enhanced Analytics Dashboard */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="charts" className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        Charts
                    </TabsTrigger>
                    <TabsTrigger value="progress" className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Progress
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Performance
                    </TabsTrigger>
                    <TabsTrigger value="comparison" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Compare
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Enhanced Statistics Cards */}
                    {analyticsData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Award className="h-4 w-4 text-purple-600" />
                                        Overall Score
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {analyticsData.overallStats.averageScore}%
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Average across {analyticsData.overallStats.totalQuizzes} quizzes
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        Success Rate
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        {analyticsData.overallStats.totalQuizzes > 0
                                            ? Math.round((analyticsData.overallStats.passedQuizzes / analyticsData.overallStats.totalQuizzes) * 100)
                                            : 0}%
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {analyticsData.overallStats.passedQuizzes} passed quizzes
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        Time Invested
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {Math.round(analyticsData.overallStats.totalTimeSpent / 3600)}h
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Total learning time
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Target className="h-4 w-4 text-orange-600" />
                                        Progress
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {analyticsData.overallStats.completionRate}%
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {analyticsData.overallStats.completedModules} of {analyticsData.overallStats.totalModules} completed
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Quick Progress List */}
                    {realtimeProgress && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="text-blue-600" />
                                    Recent Activity
                                </CardTitle>
                                <CardDescription>
                                    Your latest training progress updates
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {realtimeProgress.progressHistory?.slice(0, 5).map((item: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <span className="text-sm font-medium">Module Completed</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-green-600">
                                                    {item.quizScore || 0}%
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(item.completedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="charts" className="space-y-6">
                    {analyticsData && (
                        <ProgressAnalytics
                            quizResults={analyticsData.quizResults || []}
                            progressData={analyticsData.progressData || []}
                            overallStats={analyticsData.overallStats}
                        />
                    )}
                </TabsContent>

                <TabsContent value="progress" className="space-y-6">
                    {/* Detailed Module Progress */}
                    {moduleAnalytics && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Module Progress Details</CardTitle>
                                    <CardDescription>
                                        Detailed breakdown of your progress in each training module
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {moduleAnalytics.modules.map((module: any) => (
                                            <div key={module.moduleId} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-medium">{module.title}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant={module.status === "completed" ? "default" : "secondary"}
                                                            className={module.status === "completed" ? "bg-green-100 text-green-800" : ""}
                                                        >
                                                            {module.status.replace('_', ' ')}
                                                        </Badge>
                                                        {module.isRequired && (
                                                            <Badge variant="outline">Required</Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {module.quizScore > 0 && (
                                                    <div className="mb-3">
                                                        <div className="flex items-center justify-between text-sm mb-1">
                                                            <span>Quiz Score</span>
                                                            <span className="font-medium">{module.quizScore}%</span>
                                                        </div>
                                                        <Progress value={module.quizScore} className="h-2" />
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                    <div>
                                                        <span className="font-medium">Category:</span>
                                                        <div className="capitalize">{module.category.replace('_', ' ')}</div>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Difficulty:</span>
                                                        <div className="capitalize">{module.difficulty}</div>
                                                    </div>
                                                    {module.timeSpent > 0 && (
                                                        <div>
                                                            <span className="font-medium">Time Spent:</span>
                                                            <div>{Math.round(module.timeSpent / 60)} min</div>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="font-medium">Estimated:</span>
                                                        <div>{module.estimatedDuration} min</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                    {/* Performance Trends */}
                    {performanceTrends && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Trends</CardTitle>
                                <CardDescription>
                                    Your quiz performance over the last month
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {performanceTrends.map((trend: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium">{trend.period}</div>
                                                <div className="text-sm text-gray-500">
                                                    {trend.totalAttempts} quiz{trend.totalAttempts !== 1 ? 'es' : ''}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-blue-600">
                                                    {trend.averageScore}%
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Best: {trend.bestScore}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="comparison" className="space-y-6">
                    {/* Comparative Performance */}
                    {comparativeData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Performance</CardTitle>
                                    <CardDescription>
                                        Your quiz statistics and achievements
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span>Average Score</span>
                                        <span className="font-bold text-blue-600">
                                            {comparativeData.userStats.averageScore}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Best Score</span>
                                        <span className="font-bold text-green-600">
                                            {comparativeData.userStats.bestScore}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Percentile Rank</span>
                                        <span className="font-bold text-purple-600">
                                            {comparativeData.userStats.averagePercentile}th
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Total Attempts</span>
                                        <span className="font-bold">
                                            {comparativeData.userStats.totalAttempts}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Platform Average</CardTitle>
                                    <CardDescription>
                                        How you compare to other users
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span>Platform Average</span>
                                        <span className="font-bold">
                                            {comparativeData.globalStats.averageScore}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Your Difference</span>
                                        <span className={`font-bold ${comparativeData.comparison.scoreVsAverage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {comparativeData.comparison.scoreVsAverage >= 0 ? '+' : ''}{comparativeData.comparison.scoreVsAverage}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Performance Tier</span>
                                        <Badge
                                            variant={comparativeData.comparison.performanceTier === "above_average" ? "default" : "secondary"}
                                            className={comparativeData.comparison.performanceTier === "above_average" ? "bg-green-100 text-green-800" : ""}
                                        >
                                            {comparativeData.comparison.performanceTier.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Total Participants</span>
                                        <span className="font-bold">
                                            {comparativeData.globalStats.totalParticipants}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}