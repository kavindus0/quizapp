"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Plus,
    Edit,
    Trash2,
    Shield,
    Users,
    Trophy,
    TrendingUp,
    Play,
    Zap,
    Eye,
    BarChart3,
    Settings
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function AdminSimulationsPage() {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingScenario, setEditingScenario] = useState<any>(null);
    const [selectedType, setSelectedType] = useState<string>("all");
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

    // Convex hooks
    const scenarios = useQuery(api.simulations.getSimulationScenarios, {
        type: selectedType !== "all" ? selectedType : undefined,
        difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
    });

    const createSampleScenarios = useMutation(api.simulations.createSampleSimulationScenarios);
    const deleteScenario = useMutation(api.simulations.deleteSimulationScenario);

    // Statistics for dashboard
    const allAttempts = useQuery(api.simulations.getUserSimulationProgress);

    const handleCreateSampleScenarios = async () => {
        try {
            const result = await createSampleScenarios();
            alert(`Successfully created ${result.scenariosCreated} sample scenarios!`);
        } catch (error) {
            console.error("Failed to create sample scenarios:", error);
            alert("Failed to create sample scenarios. Check the console for details.");
        }
    };

    const handleDeleteScenario = async (scenarioId: Id<"simulationScenarios">) => {
        if (confirm("Are you sure you want to delete this scenario?")) {
            try {
                await deleteScenario({ scenarioId });
                alert("Scenario deleted successfully!");
            } catch (error) {
                console.error("Failed to delete scenario:", error);
                alert("Failed to delete scenario. Check the console for details.");
            }
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "phishing_email": return "📧";
            case "social_engineering_call": return "📞";
            case "physical_security": return "🏢";
            case "data_handling": return "📊";
            case "malware_detection": return "🦠";
            case "password_security": return "🔐";
            case "mobile_security": return "📱";
            default: return "⚠️";
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "beginner": return "bg-green-100 text-green-800";
            case "intermediate": return "bg-yellow-100 text-yellow-800";
            case "advanced": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const calculateStats = () => {
        if (!scenarios) return { total: 0, active: 0, byType: {}, byDifficulty: {} };

        const stats = {
            total: scenarios.length,
            active: scenarios.filter(s => s.isActive).length,
            byType: {} as { [key: string]: number },
            byDifficulty: {} as { [key: string]: number }
        };

        scenarios.forEach(scenario => {
            stats.byType[scenario.type] = (stats.byType[scenario.type] || 0) + 1;
            stats.byDifficulty[scenario.difficulty] = (stats.byDifficulty[scenario.difficulty] || 0) + 1;
        });

        return stats;
    };

    const stats = calculateStats();

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Simulation Management</h1>
                    <p className="text-gray-600">Manage security simulation scenarios and track performance</p>
                </div>
                <div className="flex space-x-2">
                    <Button onClick={handleCreateSampleScenarios} variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Sample Scenarios
                    </Button>
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Scenario
                    </Button>
                </div>
            </div>

            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                            Total Scenarios
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-gray-600">{stats.active} active</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-600" />
                            Most Common Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {Object.keys(stats.byType).length > 0 ?
                                Object.entries(stats.byType).sort(([, a], [, b]) => b - a)[0][0].replace('_', ' ') :
                                'None'
                            }
                        </div>
                        <p className="text-xs text-gray-600">
                            {Object.keys(stats.byType).length > 0 ?
                                Object.entries(stats.byType).sort(([, a], [, b]) => b - a)[0][1] + ' scenarios' :
                                ''
                            }
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            Difficulty Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {Object.entries(stats.byDifficulty).map(([difficulty, count]) => (
                                <div key={difficulty} className="flex justify-between text-sm">
                                    <span className="capitalize">{difficulty}:</span>
                                    <span className="font-medium">{count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4 text-orange-600" />
                            Total Attempts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allAttempts?.length || 0}</div>
                        <p className="text-xs text-gray-600">All users combined</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label>Scenario Type</Label>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="phishing_email">Phishing Email</SelectItem>
                                    <SelectItem value="social_engineering_call">Social Engineering Call</SelectItem>
                                    <SelectItem value="physical_security">Physical Security</SelectItem>
                                    <SelectItem value="data_handling">Data Handling</SelectItem>
                                    <SelectItem value="malware_detection">Malware Detection</SelectItem>
                                    <SelectItem value="password_security">Password Security</SelectItem>
                                    <SelectItem value="mobile_security">Mobile Security</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1">
                            <Label>Difficulty Level</Label>
                            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Difficulties</SelectItem>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Scenarios List */}
            <Card>
                <CardHeader>
                    <CardTitle>Simulation Scenarios</CardTitle>
                    <CardDescription>
                        {scenarios?.length || 0} scenarios found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {scenarios && scenarios.length > 0 ? (
                        <div className="grid gap-4">
                            {scenarios.map((scenario) => (
                                <Card key={scenario._id} className="border">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{getTypeIcon(scenario.type)}</span>
                                                <div>
                                                    <h3 className="font-medium">{scenario.title}</h3>
                                                    <p className="text-sm text-gray-600">{scenario.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getDifficultyColor(scenario.difficulty)}>
                                                    {scenario.difficulty}
                                                </Badge>
                                                {scenario.isActive ? (
                                                    <Badge variant="default">Active</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                            <div>
                                                <span className="font-medium">Category:</span>
                                                <div className="text-gray-600">{scenario.category.replace('_', ' ')}</div>
                                            </div>
                                            <div>
                                                <span className="font-medium">Est. Time:</span>
                                                <div className="text-gray-600">{scenario.estimatedTime} min</div>
                                            </div>
                                            <div>
                                                <span className="font-medium">Attempts:</span>
                                                <div className="text-gray-600">{scenario.totalAttempts || 0}</div>
                                            </div>
                                            <div>
                                                <span className="font-medium">Success Rate:</span>
                                                <div className="text-gray-600">{scenario.successRate || 0}%</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2">
                                                {scenario.tags?.map((tag) => (
                                                    <Badge key={tag} variant="outline" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setEditingScenario(scenario)}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDeleteScenario(scenario._id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {scenario.scenario}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No simulation scenarios found.</p>
                            <p className="text-sm">Create your first scenario to get started!</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info Card */}
            <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                    <strong>Simulation Management:</strong> Use this page to create, edit, and manage security simulation scenarios.
                    Scenarios are used to test employees' security awareness in realistic situations.
                    Monitor performance metrics to identify training needs and improve overall security posture.
                </AlertDescription>
            </Alert>
        </div>
    );
}