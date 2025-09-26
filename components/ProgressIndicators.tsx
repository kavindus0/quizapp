"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Target, TrendingUp } from "lucide-react";

interface ProgressIndicatorProps {
    title: string;
    description?: string;
    current: number;
    total: number;
    showPercentage?: boolean;
    showEstimate?: boolean;
    variant?: "default" | "success" | "warning" | "danger";
    size?: "sm" | "md" | "lg";
}

interface StepProgressProps {
    steps: Array<{
        id: string;
        title: string;
        description?: string;
        status: "completed" | "current" | "upcoming";
        optional?: boolean;
    }>;
    orientation?: "horizontal" | "vertical";
}

export function ProgressIndicator({
    title,
    description,
    current,
    total,
    showPercentage = true,
    showEstimate = false,
    variant = "default",
    size = "md"
}: ProgressIndicatorProps) {
    const percentage = total > 0 ? (current / total) * 100 : 0;

    const getVariantStyles = () => {
        switch (variant) {
            case "success":
                return "border-green-200 bg-green-50";
            case "warning":
                return "border-yellow-200 bg-yellow-50";
            case "danger":
                return "border-red-200 bg-red-50";
            default:
                return "";
        }
    };

    const getProgressColor = () => {
        if (percentage >= 100) return "bg-green-600";
        if (percentage >= 75) return "bg-blue-600";
        if (percentage >= 50) return "bg-yellow-600";
        return "bg-gray-400";
    };

    const estimateTimeRemaining = () => {
        if (!showEstimate || current === 0) return null;
        const avgTimePerItem = 5; // minutes per item
        const remaining = total - current;
        const estimatedMinutes = remaining * avgTimePerItem;

        if (estimatedMinutes < 60) {
            return `~${estimatedMinutes} minutes remaining`;
        } else {
            const hours = Math.floor(estimatedMinutes / 60);
            return `~${hours} hour${hours > 1 ? 's' : ''} remaining`;
        }
    };

    return (
        <Card className={`${getVariantStyles()} ${size === "sm" ? "p-3" : ""}`}>
            <CardHeader className={size === "sm" ? "p-3 pb-2" : ""}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <CardTitle className={size === "sm" ? "text-base" : "text-lg"}>{title}</CardTitle>
                        {percentage >= 100 && <CheckCircle className="h-5 w-5 text-green-600" />}
                    </div>
                    {showPercentage && (
                        <Badge variant={percentage >= 100 ? "default" : "secondary"}>
                            {Math.round(percentage)}%
                        </Badge>
                    )}
                </div>
                {description && (
                    <CardDescription className={size === "sm" ? "text-xs" : "text-sm"}>
                        {description}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className={size === "sm" ? "p-3 pt-0" : "pt-0"}>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span>{current} of {total} completed</span>
                        <span className="text-muted-foreground">{Math.round(percentage)}%</span>
                    </div>

                    <div className="relative">
                        <Progress
                            value={percentage}
                            className={`h-${size === "sm" ? "2" : "3"}`}
                        />
                    </div>

                    {showEstimate && estimateTimeRemaining() && (
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{estimateTimeRemaining()}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function StepProgress({ steps, orientation = "vertical" }: StepProgressProps) {
    const currentStepIndex = steps.findIndex(step => step.status === "current");
    const completedSteps = steps.filter(step => step.status === "completed").length;
    const totalSteps = steps.filter(step => !step.optional).length;

    if (orientation === "horizontal") {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Progress Steps</h3>
                        <Badge variant="outline">
                            {completedSteps}/{totalSteps} completed
                        </Badge>
                    </div>

                    <div className="flex items-center space-x-4 overflow-x-auto pb-4">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center space-x-4 min-w-0 flex-shrink-0">
                                <div className="flex flex-col items-center space-y-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step.status === "completed"
                                            ? "bg-green-600 text-white"
                                            : step.status === "current"
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-200 text-gray-600"
                                        }`}>
                                        {step.status === "completed" ? <CheckCircle className="h-4 w-4" /> : index + 1}
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-xs font-medium ${step.status === "current" ? "text-blue-600" :
                                                step.status === "completed" ? "text-green-600" :
                                                    "text-gray-500"
                                            }`}>
                                            {step.title}
                                        </p>
                                        {step.optional && (
                                            <Badge variant="outline" className="text-xs mt-1">Optional</Badge>
                                        )}
                                    </div>
                                </div>

                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 min-w-12 ${index < currentStepIndex ? "bg-green-600" : "bg-gray-200"
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Your Progress</span>
                    <Badge variant="outline">
                        {completedSteps}/{totalSteps}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 ${step.status === "completed"
                                ? "bg-green-600 text-white"
                                : step.status === "current"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-600"
                            }`}>
                            {step.status === "completed" ? <CheckCircle className="h-3 w-3" /> : index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                                <p className={`text-sm font-medium ${step.status === "current" ? "text-blue-600" :
                                        step.status === "completed" ? "text-green-600" :
                                            "text-gray-900"
                                    }`}>
                                    {step.title}
                                </p>
                                {step.optional && (
                                    <Badge variant="outline" className="text-xs">Optional</Badge>
                                )}
                                {step.status === "current" && (
                                    <Badge variant="default" className="text-xs">Current</Badge>
                                )}
                            </div>
                            {step.description && (
                                <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

// Compact progress widget for dashboards
export function ProgressWidget({
    label,
    current,
    total,
    icon: Icon
}: {
    label: string;
    current: number;
    total: number;
    icon?: React.ComponentType<any>;
}) {
    const percentage = total > 0 ? (current / total) * 100 : 0;

    return (
        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
            {Icon && <Icon className="h-5 w-5 text-blue-600 flex-shrink-0" />}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
                    <span className="text-xs text-gray-500">{current}/{total}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-xs font-medium text-gray-600">{Math.round(percentage)}%</span>
                </div>
            </div>
        </div>
    );
}