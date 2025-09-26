"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

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

interface QuizComponentProps {
    quiz: Quiz;
    moduleId: Id<"trainingModules">;
    onComplete: (score: number, passed: boolean) => void;
    onCancel: () => void;
}

export default function QuizComponent({ quiz, moduleId, onComplete, onCancel }: QuizComponentProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>(new Array(quiz.questions.length).fill(-1));
    const [showResults, setShowResults] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

    const submitProgress = useMutation(api.progress.updateProgress);

    // Timer effect
    useEffect(() => {
        if (showResults) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Auto-submit when time runs out
                    const correctAnswers = quiz.questions.reduce((count, question, index) => {
                        return count + (answers[index] === question.correctAnswerIndex ? 1 : 0);
                    }, 0);
                    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
                    const passed = score >= 70;

                    submitProgress({
                        moduleId,
                        quizScore: score,
                        completedAt: Date.now()
                    }).then(() => {
                        setShowResults(true);
                        onComplete(score, passed);
                    });

                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [showResults, quiz.questions, answers, submitProgress, moduleId, onComplete]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = answerIndex;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        // Calculate score
        let correctAnswers = 0;
        quiz.questions.forEach((question, index) => {
            if (answers[index] === question.correctAnswerIndex) {
                correctAnswers++;
            }
        });

        const score = Math.round((correctAnswers / quiz.questions.length) * 100);
        const passed = score >= 70; // Default passing score of 70%

        try {
            // Update progress in Convex
            await submitProgress({
                moduleId,
                quizScore: score,
                completedAt: Date.now()
            });

            setShowResults(true);
            onComplete(score, passed);
        } catch (error) {
            console.error("Failed to submit quiz:", error);
            alert("Failed to submit quiz. Please try again.");
        }
    };

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
    const answeredCount = answers.filter(answer => answer !== -1).length;

    if (showResults) {
        let correctAnswers = 0;
        quiz.questions.forEach((question, index) => {
            if (answers[index] === question.correctAnswerIndex) {
                correctAnswers++;
            }
        });

        const score = Math.round((correctAnswers / quiz.questions.length) * 100);
        const passed = score >= 70;

        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Quiz Results</CardTitle>
                    <div className="flex items-center justify-center space-x-2 mt-4">
                        {passed ? (
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        ) : (
                            <XCircle className="h-8 w-8 text-red-500" />
                        )}
                        <Badge variant={passed ? "default" : "destructive"} className="text-lg px-4 py-2">
                            {passed ? "Passed" : "Failed"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <div className="text-4xl font-bold mb-2">{score}%</div>
                        <p className="text-sm text-muted-foreground">
                            You answered {correctAnswers} out of {quiz.questions.length} questions correctly
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Passing score: 70%
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold">Question Review:</h3>
                        {quiz.questions.map((question, index) => {
                            const userAnswer = answers[index];
                            const isCorrect = userAnswer === question.correctAnswerIndex;

                            return (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        {isCorrect ? (
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium mb-2">{question.questionText}</p>
                                            <div className="space-y-1">
                                                {question.options.map((option, optIndex) => (
                                                    <div
                                                        key={optIndex}
                                                        className={`text-sm p-2 rounded ${optIndex === question.correctAnswerIndex
                                                                ? 'bg-green-100 text-green-800'
                                                                : optIndex === userAnswer && !isCorrect
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'text-gray-600'
                                                            }`}
                                                    >
                                                        {optIndex + 1}. {option}
                                                        {optIndex === question.correctAnswerIndex && " ✓"}
                                                        {optIndex === userAnswer && optIndex !== question.correctAnswerIndex && " ✗"}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-center">
                        <Button onClick={onCancel}>Return to Training</Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{quiz.title}</CardTitle>
                    <div className="text-right">
                        <div className="text-sm text-muted-foreground">Time Left</div>
                        <div className="text-lg font-mono">{formatTime(timeLeft)}</div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                        <span>{answeredCount} answered</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-4">{currentQuestion.questionText}</h3>
                    <RadioGroup
                        value={answers[currentQuestionIndex]?.toString()}
                        onValueChange={(value) => handleAnswerSelect(currentQuestionIndex, parseInt(value))}
                    >
                        {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>

                    <div className="flex space-x-2">
                        {currentQuestionIndex === quiz.questions.length - 1 ? (
                            <Button
                                onClick={handleSubmitQuiz}
                                disabled={answeredCount !== quiz.questions.length}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Submit Quiz
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                disabled={answers[currentQuestionIndex] === -1}
                            >
                                Next
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>

                {answeredCount !== quiz.questions.length && currentQuestionIndex === quiz.questions.length - 1 && (
                    <p className="text-sm text-amber-600 text-center">
                        Please answer all questions before submitting
                    </p>
                )}

                <div className="flex justify-center">
                    <Button variant="ghost" onClick={onCancel}>
                        Cancel Quiz
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}