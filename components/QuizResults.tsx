"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Trophy, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

interface QuizResultsProps {
    resultId: Id<"quizResults">;
}

export default function QuizResults({ resultId }: QuizResultsProps) {
    const router = useRouter();
    const result = useQuery(api.quizzes.getQuizResultDetails, { resultId });

    const formatTime = (seconds: number): string => {
        if (!seconds) return "N/A";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (timestamp: number): string => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!result) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading results...</p>
                </div>
            </div>
        );
    }

    const correctCount = result.questionAnalysis.filter(q => q.isCorrect).length;
    const incorrectCount = result.questionAnalysis.length - correctCount;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Quiz Results</h1>
                    <p className="text-gray-600">{result.quiz.title}</p>
                </div>
            </div>

            {/* Overall Results */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {result.percentage >= 70 ? (
                            <Trophy className="h-6 w-6 text-yellow-500" />
                        ) : (
                            <XCircle className="h-6 w-6 text-red-500" />
                        )}
                        Overall Score: {result.percentage}%
                    </CardTitle>
                    <CardDescription>
                        Completed on {formatDate(result.completedAt)}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                            <div className="text-sm text-green-700">Correct</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{incorrectCount}</div>
                            <div className="text-sm text-red-700">Incorrect</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{result.totalQuestions}</div>
                            <div className="text-sm text-blue-700">Total Questions</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-600 flex items-center justify-center gap-1">
                                <Clock className="h-5 w-5" />
                                {formatTime(result.timeSpent)}
                            </div>
                            <div className="text-sm text-gray-700">Time Taken</div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 rounded-lg border-2 border-dashed">
                        <div className="text-center">
                            <div className={`text-lg font-semibold ${result.percentage >= 70 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {result.percentage >= 70 ? '🎉 Congratulations! You Passed!' : '📚 Keep Learning!'}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                {result.percentage >= 70
                                    ? 'You have successfully completed this training module.'
                                    : 'Review the questions below and try again when ready. Passing score: 70%'
                                }
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Question-by-Question Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle>Question Analysis</CardTitle>
                    <CardDescription>
                        Detailed breakdown of your answers
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {result.questionAnalysis.map((question, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border-2 ${question.isCorrect
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-red-200 bg-red-50'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                    {question.isCorrect ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold text-gray-900">
                                            Question {question.questionNumber}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${question.isCorrect
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {question.isCorrect ? 'Correct' : 'Incorrect'}
                                        </span>
                                    </div>

                                    <p className="font-medium text-gray-900 mb-3">
                                        {question.questionText}
                                    </p>

                                    <div className="space-y-2">
                                        <div className={`p-2 rounded ${question.isCorrect ? 'bg-green-100' : 'bg-red-100'
                                            }`}>
                                            <div className="text-sm font-medium text-gray-700">Your Answer:</div>
                                            <div className="text-gray-900">{question.userAnswerText}</div>
                                        </div>

                                        {!question.isCorrect && (
                                            <div className="p-2 rounded bg-green-100">
                                                <div className="text-sm font-medium text-gray-700">Correct Answer:</div>
                                                <div className="text-gray-900">{question.correctAnswerText}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pb-8">
                <Button variant="outline" onClick={() => router.push('/training')}>
                    Back to Training
                </Button>
                <Button onClick={() => router.push('/quiz/my-results')}>
                    View All Results
                </Button>
            </div>
        </div>
    );
}