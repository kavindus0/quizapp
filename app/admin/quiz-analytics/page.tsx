"use client";

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    BarChart,
    Users,
    Award,
    TrendingUp,
    CheckCircle,
    XCircle,
    Calendar,
    Target
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function AdminQuizDashboard() {
    const [selectedTab, setSelectedTab] = useState("overview");

    // Fetch data
    const quizStats = useQuery(api.reports.getQuizStatistics);
    const allResults = useQuery(api.reports.getAllQuizResults);
    const completionStats = useQuery(api.reports.getTrainingCompletionStats);

    if (!quizStats || !allResults || !completionStats) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center">Loading quiz statistics...</div>
            </div>
        );
    }

    const { overall, byQuiz, byUser } = quizStats;

    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentResults = allResults.filter(result =>
        new Date(result.completedAt) > sevenDaysAgo
    );

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Quiz & Training Analytics</h1>
                    <p className="text-gray-600">Comprehensive overview of training completion and quiz performance</p>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Quiz Attempts</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overall.totalAttempts}</div>
                        <p className="text-xs text-muted-foreground">
                            {recentResults.length} in the last 7 days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overall Pass Rate</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overall.passRate.toFixed(1)}%</div>
                        <Progress value={overall.passRate} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overall.averageScore.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            Across all completed quizzes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{byUser.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Users who have taken quizzes
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="quiz-performance">Quiz Performance</TabsTrigger>
                    <TabsTrigger value="user-progress">User Progress</TabsTrigger>
                    <TabsTrigger value="completion-tracking">Completion Tracking</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Quiz Results */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Quiz Results</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recentResults.slice(0, 5).map((result) => (
                                        <div key={result._id} className="flex items-center justify-between p-2 border rounded">
                                            <div>
                                                <div className="font-medium text-sm">{result.userName}</div>
                                                <div className="text-xs text-gray-500">{result.quizTitle}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={result.passed ? "default" : "destructive"}>
                                                    {result.score}/{result.totalQuestions}
                                                </Badge>
                                                {result.passed ? (
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-red-600" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Performing Quizzes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Performing Quizzes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {byQuiz
                                        .sort((a, b) => b.passRate - a.passRate)
                                        .slice(0, 5)
                                        .map((quiz) => (
                                            <div key={quiz.quizId} className="flex items-center justify-between p-2 border rounded">
                                                <div>
                                                    <div className="font-medium text-sm">{quiz.quizTitle}</div>
                                                    <div className="text-xs text-gray-500">{quiz.attempts} attempts</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">{quiz.passRate.toFixed(1)}% pass rate</div>
                                                    <div className="text-xs text-gray-500">Avg: {quiz.averageScore.toFixed(1)}%</div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="quiz-performance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quiz Performance Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Quiz Title</TableHead>
                                        <TableHead>Attempts</TableHead>
                                        <TableHead>Passes</TableHead>
                                        <TableHead>Pass Rate</TableHead>
                                        <TableHead>Average Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {byQuiz.map((quiz) => (
                                        <TableRow key={quiz.quizId}>
                                            <TableCell className="font-medium">{quiz.quizTitle}</TableCell>
                                            <TableCell>{quiz.attempts}</TableCell>
                                            <TableCell>{quiz.passes}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={quiz.passRate} className="w-20" />
                                                    <span className="text-sm">{quiz.passRate.toFixed(1)}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{quiz.averageScore.toFixed(1)}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="user-progress" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Completed Quizzes</TableHead>
                                        <TableHead>Passed Quizzes</TableHead>
                                        <TableHead>Pass Rate</TableHead>
                                        <TableHead>Average Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {byUser
                                        .sort((a, b) => b.averageScore - a.averageScore)
                                        .map((user) => (
                                            <TableRow key={user.userId}>
                                                <TableCell className="font-medium">{user.userName}</TableCell>
                                                <TableCell>{user.userEmail}</TableCell>
                                                <TableCell>{user.completedQuizzes}</TableCell>
                                                <TableCell>{user.passedQuizzes}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={user.passRate} className="w-20" />
                                                        <span className="text-sm">{user.passRate.toFixed(1)}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{user.averageScore.toFixed(1)}%</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="completion-tracking" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Training Completion Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Completed Quizzes</TableHead>
                                        <TableHead>Total Available</TableHead>
                                        <TableHead>Completion Rate</TableHead>
                                        <TableHead>Last Activity</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {completionStats.map((user) => (
                                        <TableRow key={user.userId}>
                                            <TableCell className="font-medium">{user.userName}</TableCell>
                                            <TableCell>{user.userEmail}</TableCell>
                                            <TableCell>{user.completedQuizzes}</TableCell>
                                            <TableCell>{user.totalQuizzes}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={user.completionRate} className="w-20" />
                                                    <span className="text-sm">{user.completionRate.toFixed(1)}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.lastActivity ? (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        <span className="text-sm">
                                                            {new Date(user.lastActivity).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 text-sm">No activity</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}