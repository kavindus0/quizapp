"use client";

import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Award, RotateCcw, FileText, TrendingUp, AlertCircle, BookOpen, Target } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface QuizModuleProps {
    moduleId: Id<"trainingModules">;
    quizId?: Id<"quizzes">;
}

interface Question {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
}

interface Quiz {
    _id: Id<"quizzes">;
    title: string;
    questions: Question[];
}

interface QuizResult {
    _id: Id<"quizResults">;
    userId: string;
    quizId: Id<"quizzes">;
    score: number;
    totalQuestions: number;
    percentage: number;
    completedAt: number;
    answers: number[];
    timeSpent?: number;
}

export default function QuizModule({ moduleId, quizId }: QuizModuleProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch quiz data
    const quiz = useQuery(api.quizzes.get, quizId ? { id: quizId } : "skip") as Quiz | undefined;

    // Debug logging
    console.log("QuizModule - quizId:", quizId);
    console.log("QuizModule - quiz:", quiz);

    // Check if user has already taken this quiz
    const existingResult = useQuery(
        api.quizzes.getMyQuizResults,
        {}
    ) as QuizResult[] | undefined;    // Mutations
    const submitQuiz = useMutation(api.quizzes.submitQuiz);

    // Find existing result for this specific quiz
    const specificResult = existingResult?.find(result => result.quizId === quizId);

    const handleAnswerSelect = (answerIndex: number) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestion] = answerIndex;
        setSelectedAnswers(newAnswers);
    };

    const handleNextQuestion = () => {
        if (currentQuestion < (quiz?.questions.length || 0) - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!quiz || !quizId) return;

        setIsSubmitting(true);
        try {
            await submitQuiz({
                quizId,
                answers: selectedAnswers
            });
            setShowResults(true);
            // No automatic redirect - let user view their results
        } catch (error) {
            console.error('Error submitting quiz:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetakeQuiz = () => {
        setCurrentQuestion(0);
        setSelectedAnswers([]);
        setShowResults(false);
    };

    const calculateScore = () => {
        if (!quiz) return 0;
        let correct = 0;
        selectedAnswers.forEach((answer, index) => {
            if (answer === quiz.questions[index]?.correctAnswerIndex) {
                correct++;
            }
        });
        return correct;
    };

    const getScorePercentage = (score: number, total: number) => {
        return Math.round((score / total) * 100);
    };

    if (!quiz) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="p-6">
                    <div className="text-center text-gray-500">
                        No quiz available for this module yet.
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show existing results if user has already taken the quiz
    if (specificResult && !showResults) {
        const scorePercentage = specificResult.percentage || getScorePercentage(specificResult.score, specificResult.totalQuestions);
        const passed = scorePercentage >= 70;
        const incorrectAnswers = specificResult.totalQuestions - specificResult.score;

        const getPerformanceLevel = (percentage: number) => {
            if (percentage >= 90) return { level: "Excellent", color: "text-green-600", bgColor: "bg-green-50" };
            if (percentage >= 80) return { level: "Good", color: "text-blue-600", bgColor: "bg-blue-50" };
            if (percentage >= 70) return { level: "Satisfactory", color: "text-yellow-600", bgColor: "bg-yellow-50" };
            return { level: "Needs Improvement", color: "text-red-600", bgColor: "bg-red-50" };
        };

        const performance = getPerformanceLevel(scorePercentage);

        return (
            <div className="w-full max-w-4xl mx-auto space-y-6">
                {/* Previous Results Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="text-blue-600" />
                            Previous Quiz Results - {quiz?.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                {passed ? (
                                    <CheckCircle className="text-green-600 h-12 w-12" />
                                ) : (
                                    <XCircle className="text-red-600 h-12 w-12" />
                                )}
                                <div>
                                    <div className="text-4xl font-bold">
                                        {specificResult.score}/{specificResult.totalQuestions}
                                    </div>
                                    <div className="text-lg text-gray-600">
                                        {scorePercentage}% Score
                                    </div>
                                </div>
                            </div>

                            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-medium ${passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {passed ? (
                                    <>
                                        <Award size={24} />
                                        Passed
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={24} />
                                        Failed (70% required)
                                    </>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Performance Summary */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className={`p-4 rounded-lg ${performance.bgColor}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className={`h-5 w-5 ${performance.color}`} />
                                    <span className="font-medium">Performance Level</span>
                                </div>
                                <div className={`text-lg font-semibold ${performance.color}`}>
                                    {performance.level}
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-blue-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="h-5 w-5 text-blue-600" />
                                    <span className="font-medium">Correct Answers</span>
                                </div>
                                <div className="text-lg font-semibold text-blue-600">
                                    {specificResult.score} out of {specificResult.totalQuestions}
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-orange-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="h-5 w-5 text-orange-600" />
                                    <span className="font-medium">Incorrect</span>
                                </div>
                                <div className="text-lg font-semibold text-orange-600">
                                    {incorrectAnswers} {incorrectAnswers === 1 ? 'Answer' : 'Answers'}
                                </div>
                            </div>
                        </div>

                        <div className="text-center text-sm text-gray-500">
                            Completed on: {new Date(specificResult.completedAt).toLocaleDateString()} at {new Date(specificResult.completedAt).toLocaleTimeString()}
                        </div>
                    </CardContent>
                </Card>

                {/* Quiz Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="text-indigo-600" />
                            Training Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {passed ? (
                            <Alert>
                                <Award className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Training Complete!</strong> You have successfully passed this assessment
                                    and met the security training requirements.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Retake Required:</strong> You need to score at least 70% to pass.
                                    Please review the training materials and try again.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-center gap-4 pt-4">
                            <Button
                                onClick={() => window.print()}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                Print Report
                            </Button>

                            {!passed && (
                                <Button
                                    onClick={handleRetakeQuiz}
                                    className="flex items-center gap-2"
                                >
                                    <RotateCcw size={16} />
                                    Retake Quiz
                                </Button>
                            )}

                            <Button
                                onClick={() => window.history.back()}
                                variant="outline"
                            >
                                Back to Training
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show results after submission
    if (showResults) {
        const score = calculateScore();
        const scorePercentage = getScorePercentage(score, quiz.questions.length);
        const passed = scorePercentage >= 70;
        const incorrectAnswers = selectedAnswers.filter((answer, index) =>
            answer !== quiz.questions[index]?.correctAnswerIndex
        ).length;

        // Generate performance insights
        const getPerformanceLevel = (percentage: number) => {
            if (percentage >= 90) return { level: "Excellent", color: "text-green-600", bgColor: "bg-green-50" };
            if (percentage >= 80) return { level: "Good", color: "text-blue-600", bgColor: "bg-blue-50" };
            if (percentage >= 70) return { level: "Satisfactory", color: "text-yellow-600", bgColor: "bg-yellow-50" };
            return { level: "Needs Improvement", color: "text-red-600", bgColor: "bg-red-50" };
        };

        const performance = getPerformanceLevel(scorePercentage);

        return (
            <div className="w-full max-w-4xl mx-auto space-y-6">
                {/* Overall Results Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="text-blue-600" />
                            Quiz Report - {quiz.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Score Summary */}
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                {passed ? (
                                    <CheckCircle className="text-green-600 h-12 w-12" />
                                ) : (
                                    <XCircle className="text-red-600 h-12 w-12" />
                                )}
                                <div>
                                    <div className="text-4xl font-bold">
                                        {score}/{quiz.questions.length}
                                    </div>
                                    <div className="text-lg text-gray-600">
                                        {scorePercentage}% Score
                                    </div>
                                </div>
                            </div>

                            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-medium ${passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {passed ? (
                                    <>
                                        <Award size={24} />
                                        Passed!
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={24} />
                                        Failed (70% required)
                                    </>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Performance Summary */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className={`p-4 rounded-lg ${performance.bgColor}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className={`h-5 w-5 ${performance.color}`} />
                                    <span className="font-medium">Performance Level</span>
                                </div>
                                <div className={`text-lg font-semibold ${performance.color}`}>
                                    {performance.level}
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-blue-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="h-5 w-5 text-blue-600" />
                                    <span className="font-medium">Correct Answers</span>
                                </div>
                                <div className="text-lg font-semibold text-blue-600">
                                    {score} out of {quiz.questions.length}
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-orange-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="h-5 w-5 text-orange-600" />
                                    <span className="font-medium">Areas to Review</span>
                                </div>
                                <div className="text-lg font-semibold text-orange-600">
                                    {incorrectAnswers} {incorrectAnswers === 1 ? 'Topic' : 'Topics'}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Completion Date */}
                        <div className="text-center text-sm text-gray-500">
                            Completed on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                        </div>
                    </CardContent>
                </Card>

                {/* Question-by-Question Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="text-purple-600" />
                            Question Review
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {quiz.questions.map((question, index) => {
                            const userAnswer = selectedAnswers[index];
                            const isCorrect = userAnswer === question.correctAnswerIndex;

                            return (
                                <div key={index} className={`p-4 rounded-lg border-l-4 ${isCorrect ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'
                                    }`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={isCorrect ? "default" : "destructive"}>
                                                Question {index + 1}
                                            </Badge>
                                            {isCorrect ? (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-600" />
                                            )}
                                        </div>
                                        <Badge variant="outline">
                                            {isCorrect ? 'Correct' : 'Incorrect'}
                                        </Badge>
                                    </div>

                                    <h4 className="font-medium mb-3">{question.questionText}</h4>

                                    <div className="space-y-2">
                                        <div className="text-sm">
                                            <span className="font-medium">Your Answer: </span>
                                            <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                                                {question.options[userAnswer] || 'Not answered'}
                                            </span>
                                        </div>

                                        {!isCorrect && (
                                            <div className="text-sm">
                                                <span className="font-medium">Correct Answer: </span>
                                                <span className="text-green-700">
                                                    {question.options[question.correctAnswerIndex]}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Recommendations and Next Steps */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="text-indigo-600" />
                            Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {passed ? (
                            <Alert>
                                <Award className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Congratulations!</strong> You have successfully completed this assessment.
                                    Your knowledge in this area meets our security standards.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Additional Training Required:</strong> Please review the training materials
                                    for the topics you missed and retake the assessment when ready.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Performance-based recommendations */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Study Recommendations
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                    {scorePercentage < 70 && (
                                        <>
                                            <li>Review all training materials thoroughly</li>
                                            <li>Focus on topics where you answered incorrectly</li>
                                            <li>Take additional practice assessments if available</li>
                                        </>
                                    )}
                                    {scorePercentage >= 70 && scorePercentage < 90 && (
                                        <>
                                            <li>Review specific topics you missed</li>
                                            <li>Stay updated with security best practices</li>
                                        </>
                                    )}
                                    {scorePercentage >= 90 && (
                                        <>
                                            <li>Excellent work! Continue staying updated</li>
                                            <li>Consider helping colleagues with training</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium">Next Steps</h4>
                                <div className="space-y-2">
                                    {passed ? (
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                            Training requirement completed
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-orange-600">
                                            <AlertCircle className="h-4 w-4" />
                                            Retake required to complete training
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-center gap-4">
                            <Button
                                onClick={() => window.print()}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                Print Report
                            </Button>

                            {!passed && (
                                <Button
                                    onClick={handleRetakeQuiz}
                                    className="flex items-center gap-2"
                                >
                                    <RotateCcw size={16} />
                                    Retake Quiz
                                </Button>
                            )}

                            <Button
                                onClick={() => {
                                    setShowResults(false);
                                    window.history.back();
                                }}
                                variant="outline"
                            >
                                Back to Training
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show quiz questions
    const currentQ = quiz.questions[currentQuestion];
    const isLastQuestion = currentQuestion === quiz.questions.length - 1;
    const canProceed = selectedAnswers[currentQuestion] !== undefined;
    const allQuestionsAnswered = selectedAnswers.length === quiz.questions.length &&
        selectedAnswers.every(answer => answer !== undefined);

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                <div className="text-sm text-gray-600">
                    Question {currentQuestion + 1} of {quiz.questions.length}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                    />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-4">{currentQ.questionText}</h3>
                    <RadioGroup
                        value={selectedAnswers[currentQuestion]?.toString() || ""}
                        onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                    >
                        {currentQ.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2 p-3 rounded border hover:bg-gray-50">
                                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <div className="flex justify-between items-center pt-4">
                    <Button
                        variant="outline"
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestion === 0}
                    >
                        Previous
                    </Button>

                    <div className="text-sm text-gray-500">
                        {selectedAnswers.filter(a => a !== undefined).length} / {quiz.questions.length} answered
                    </div>

                    {!isLastQuestion ? (
                        <Button
                            onClick={handleNextQuestion}
                            disabled={!canProceed}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmitQuiz}
                            disabled={!allQuestionsAnswered || isSubmitting}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}