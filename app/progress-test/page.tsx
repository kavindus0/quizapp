"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, BookOpen, TrendingUp, Target } from "lucide-react";

export default function ProgressTestPage() {
    const { user, isLoaded } = useUser();
    const realtimeProgress = useQuery(api.realtimeProgress.getRealtimeProgress);
    const progressStats = useQuery(api.realtimeProgress.getProgressStats);

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
                            <div className="text-2xl font-bold text-orange-600">{progressStats.inProgressModules}</div>
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

            {/* Real-time Progress List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="text-blue-600" />
                        Live Progress Tracking
                    </CardTitle>
                    <CardDescription>
                        Real-time updates of your training module progress and quiz scores
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {realtimeProgress && realtimeProgress.length > 0 ? (
                        <div className="space-y-4">
                            {realtimeProgress.map((progress, index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium">{progress.moduleTitle}</h3>
                                        <Badge
                                            variant={progress.isCompleted ? "default" : "secondary"}
                                            className={progress.isCompleted ? "bg-green-100 text-green-800" : ""}
                                        >
                                            {progress.isCompleted ? "Completed" : "In Progress"}
                                        </Badge>
                                    </div>

                                    {progress.quizScore !== undefined && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Quiz Score</span>
                                                <span className="font-medium">{progress.quizScore}%</span>
                                            </div>
                                            <Progress
                                                value={progress.quizScore}
                                                className="h-2"
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                        {progress.lastAccessedAt && (
                                            <div>
                                                <span className="font-medium">Last Accessed:</span>
                                                <div>{new Date(progress.lastAccessedAt).toLocaleString()}</div>
                                            </div>
                                        )}

                                        {progress.completedAt && (
                                            <div>
                                                <span className="font-medium">Completed:</span>
                                                <div>{new Date(progress.completedAt).toLocaleString()}</div>
                                            </div>
                                        )}

                                        {progress.timeSpent && (
                                            <div>
                                                <span className="font-medium">Time Spent:</span>
                                                <div>{Math.round(progress.timeSpent / 60)} minutes</div>
                                            </div>
                                        )}
                                    </div>

                                    {progress.completionMethod && (
                                        <div className="text-sm">
                                            <Badge variant="outline">
                                                Completed via: {progress.completionMethod.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No training progress found.</p>
                            <p className="text-sm">Start taking quizzes to see real-time progress updates!</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Real-time Updates Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">About Real-time Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p>• Progress updates automatically when you complete quizzes</p>
                        <p>• Quiz scores are tracked in real-time with instant feedback</p>
                        <p>• Module completion status updates based on quiz performance (70% passing grade)</p>
                        <p>• Time spent and access patterns are recorded for progress analysis</p>
                        <p>• Completion methods track whether modules were completed via quiz or other means</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}