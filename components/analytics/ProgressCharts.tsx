"use client";

import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Award, Clock } from "lucide-react";

interface QuizResult {
    quizId: string;
    score: number;
    percentage: number;
    completedAt: number;
    timeSpent?: number;
}

interface ProgressData {
    moduleId: string;
    moduleTitle: string;
    quizScore?: number;
    completedAt: number;
    timeSpent?: number;
    isCompleted: boolean;
}

interface AnalyticsProps {
    quizResults: QuizResult[];
    progressData: ProgressData[];
    overallStats?: {
        totalModules: number;
        completedModules: number;
        averageScore: number;
        totalTimeSpent: number;
    };
}

// Colors for charts
const COLORS = {
    primary: "#3B82F6",
    secondary: "#10B981",
    accent: "#F59E0B",
    danger: "#EF4444",
    purple: "#8B5CF6",
    teal: "#14B8A6",
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.danger];

export function ScoreDistributionChart({ quizResults }: { quizResults: QuizResult[] }) {
    // Group scores into ranges
    const scoreRanges = [
        { range: "90-100%", count: 0, color: COLORS.secondary },
        { range: "80-89%", count: 0, color: COLORS.primary },
        { range: "70-79%", count: 0, color: COLORS.accent },
        { range: "60-69%", count: 0, color: COLORS.danger },
        { range: "Below 60%", count: 0, color: "#6B7280" },
    ];

    quizResults.forEach((result) => {
        const score = result.percentage;
        if (score >= 90) scoreRanges[0].count++;
        else if (score >= 80) scoreRanges[1].count++;
        else if (score >= 70) scoreRanges[2].count++;
        else if (score >= 60) scoreRanges[3].count++;
        else scoreRanges[4].count++;
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Score Distribution
                </CardTitle>
                <CardDescription>
                    Distribution of your quiz scores across different ranges
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={scoreRanges}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill={COLORS.primary} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function ProgressOverTimeChart({ quizResults }: { quizResults: QuizResult[] }) {
    // Sort results by date and create cumulative data
    const sortedResults = [...quizResults]
        .sort((a, b) => a.completedAt - b.completedAt)
        .map((result, index) => ({
            date: new Date(result.completedAt).toLocaleDateString(),
            score: result.percentage,
            attempt: index + 1,
            averageScore:
                quizResults
                    .slice(0, index + 1)
                    .reduce((sum, r) => sum + r.percentage, 0) / (index + 1),
        }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Progress Over Time
                </CardTitle>
                <CardDescription>
                    Your quiz performance and improvement over time
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sortedResults}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke={COLORS.primary}
                            strokeWidth={2}
                            name="Quiz Score"
                        />
                        <Line
                            type="monotone"
                            dataKey="averageScore"
                            stroke={COLORS.secondary}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="Average Score"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function CompletionStatusPieChart({ progressData }: { progressData: ProgressData[] }) {
    const completed = progressData.filter(p => p.isCompleted).length;
    const inProgress = progressData.filter(p => !p.isCompleted && p.completedAt > 0).length;
    const notStarted = progressData.length - completed - inProgress;

    const data = [
        { name: "Completed", value: completed, color: COLORS.secondary },
        { name: "In Progress", value: inProgress, color: COLORS.accent },
        { name: "Not Started", value: notStarted, color: "#6B7280" },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    Module Completion Status
                </CardTitle>
                <CardDescription>
                    Overview of your training module progress
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value, percent }: any) =>
                                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function TimeSpentChart({ progressData }: { progressData: ProgressData[] }) {
    const moduleTimeData = progressData
        .filter(p => p.timeSpent && p.timeSpent > 0)
        .map(p => ({
            module: p.moduleTitle.length > 20
                ? p.moduleTitle.substring(0, 20) + "..."
                : p.moduleTitle,
            timeSpent: Math.round((p.timeSpent || 0) / 60), // Convert to minutes
            score: p.quizScore || 0,
        }))
        .sort((a, b) => b.timeSpent - a.timeSpent)
        .slice(0, 10); // Top 10 modules by time spent

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Time Spent by Module
                </CardTitle>
                <CardDescription>
                    Time invested in each training module (minutes)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={moduleTimeData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="module" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="timeSpent" fill={COLORS.accent} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function RadialProgressChart({ overallStats }: { overallStats: any }) {
    const completionRate = overallStats?.totalModules > 0
        ? Math.round((overallStats.completedModules / overallStats.totalModules) * 100)
        : 0;

    const data = [
        {
            name: "Completion",
            value: completionRate,
            fill: COLORS.primary,
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-center">Overall Progress</CardTitle>
                <CardDescription className="text-center">
                    Your training completion rate
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={data}>
                        <RadialBar
                            label={{ position: "insideStart", fill: "#fff" }}
                            background
                            dataKey="value"
                        />
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-current text-2xl font-bold">
                            {completionRate}%
                        </text>
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="text-center mt-4 space-y-1">
                    <p className="text-sm text-gray-600">
                        {overallStats?.completedModules || 0} of {overallStats?.totalModules || 0} modules completed
                    </p>
                    <p className="text-xs text-gray-500">
                        Average Score: {overallStats?.averageScore || 0}%
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export function WeeklyActivityChart({ quizResults }: { quizResults: QuizResult[] }) {
    // Group results by week
    const weeklyData = new Map();
    const now = new Date();

    // Initialize last 8 weeks
    for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - i * 7);
        const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        weeklyData.set(weekLabel, { week: weekLabel, quizzes: 0, avgScore: 0, totalScore: 0 });
    }

    // Populate with actual data
    quizResults.forEach(result => {
        const resultDate = new Date(result.completedAt);
        const weekStart = new Date(resultDate);
        weekStart.setDate(resultDate.getDate() - resultDate.getDay()); // Start of week
        const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        if (weeklyData.has(weekLabel)) {
            const weekData = weeklyData.get(weekLabel);
            weekData.quizzes++;
            weekData.totalScore += result.percentage;
            weekData.avgScore = Math.round(weekData.totalScore / weekData.quizzes);
        }
    });

    const chartData = Array.from(weeklyData.values());

    return (
        <Card>
            <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>
                    Your quiz activity and performance over the last 8 weeks
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="quizzes"
                            stackId="1"
                            stroke={COLORS.primary}
                            fill={COLORS.primary}
                            fillOpacity={0.6}
                            name="Quizzes Taken"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="avgScore"
                            stroke={COLORS.secondary}
                            strokeWidth={3}
                            name="Average Score"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export default function ProgressAnalytics(props: AnalyticsProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RadialProgressChart overallStats={props.overallStats} />
                <CompletionStatusPieChart progressData={props.progressData} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ProgressOverTimeChart quizResults={props.quizResults} />
                <ScoreDistributionChart quizResults={props.quizResults} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <TimeSpentChart progressData={props.progressData} />
                <WeeklyActivityChart quizResults={props.quizResults} />
            </div>
        </div>
    );
}