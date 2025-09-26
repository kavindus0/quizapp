"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

interface QuizTakerProps {
    quizId: Id<"quizzes">;
}

export default function QuizTaker({ quizId }: QuizTakerProps) {
    const router = useRouter();
    const quiz = useQuery(api.quizzes.get, { id: quizId });
    const submitQuiz = useMutation(api.quizzes.submitQuiz);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [timeSpent, setTimeSpent] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Start timer when quiz loads
    useEffect(() => {
        if (quiz && !startTime) {
            setStartTime(Date.now());
            // Initialize answers array
            setAnswers(new Array(quiz.questions?.length || 0).fill(-1));
        }
    }, [quiz, startTime]);

    // Update timer
    useEffect(() => {
        if (startTime && !isCompleted) {
            const interval = setInterval(() => {
                setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [startTime, isCompleted]);

    const handleAnswerChange = (answerIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answerIndex;
        setAnswers(newAnswers);
    };

    const nextQuestion = () => {
        if (quiz && currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const previousQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        if (!quiz || !startTime) return;

        setIsSubmitting(true);
        try {
            const finalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
            const result = await submitQuiz({
                quizId,
                answers,
                timeSpent: finalTimeSpent,
            });
            setResult(result);
            setIsCompleted(true);
        } catch (error) {
            console.error("Error submitting quiz:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!quiz) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (isCompleted && result) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                        {result.passed ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                            <XCircle className="h-6 w-6 text-red-600" />
                        )}
                        Quiz Completed!
                    </CardTitle>
                    <CardDescription>Here are your results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">
                                {result.score}/{result.totalQuestions}
                            </div>
                            <div className="text-sm text-gray-600">Correct Answers</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">
                                {result.percentage}%
                            </div>
                            <div className="text-sm text-gray-600">Overall Score</div>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className={`text-lg font-semibold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {result.passed ? '✅ Passed' : '❌ Failed'}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                            Passing score: 70%
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Time taken: {formatTime(timeSpent)}</span>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            onClick={() => router.push(`/quiz/results/${result.resultId}`)}
                            className="flex-1"
                        >
                            View Detailed Results
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/training')}
                            className="flex-1"
                        >
                            Back to Training
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
    const answeredQuestions = answers.filter(answer => answer !== -1).length;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Quiz Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{quiz.title}</CardTitle>
                            <CardDescription>
                                Question {currentQuestion + 1} of {quiz.questions.length}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTime(timeSpent)}
                            </div>
                            <div>
                                Answered: {answeredQuestions}/{quiz.questions.length}
                            </div>
                        </div>
                    </div>
                    <Progress value={progress} className="w-full" />
                </CardHeader>
            </Card>

            {/* Question Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{question.questionText}</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={answers[currentQuestion]?.toString()}
                        onValueChange={(value) => handleAnswerChange(parseInt(value))}
                        className="space-y-3"
                    >
                        {question.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer py-2">
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center">
                <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                </Button>

                <div className="flex gap-2">
                    {currentQuestion === quiz.questions.length - 1 ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || answeredQuestions < quiz.questions.length}
                            className="flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Submitting...
                                </>
                            ) : (
                                'Submit Quiz'
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={nextQuestion}
                            disabled={answers[currentQuestion] === -1}
                            className="flex items-center gap-2"
                        >
                            Next
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Question Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Question Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-10 gap-2">
                        {quiz.questions.map((_, index) => (
                            <Button
                                key={index}
                                variant={currentQuestion === index ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentQuestion(index)}
                                className={`h-8 w-8 p-0 ${answers[index] !== -1
                                        ? "bg-green-100 border-green-300 hover:bg-green-200"
                                        : ""
                                    }`}
                            >
                                {index + 1}
                            </Button>
                        ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-600">
                        Click a number to jump to that question. Green indicates answered questions.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}