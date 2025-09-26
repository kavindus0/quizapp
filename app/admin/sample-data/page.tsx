"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
    Database,
    FileText,
    GraduationCap,
    HelpCircle,
    Users,
    CheckCircle,
    AlertCircle,
    Loader2
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default function SampleDataPage() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const addSamplePolicies = useMutation(api.sampleData.addSamplePolicies);
    const addSampleTraining = useMutation(api.sampleData.addSampleTraining);
    const addSampleQuizzes = useMutation(api.sampleData.addSampleQuizzes);
    const linkQuizzesToTraining = useMutation(api.sampleData.linkQuizzesToTraining);
    const addAllSampleData = useMutation(api.sampleData.addAllSampleData);

    const handleAddAllData = async () => {
        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const result = await addAllSampleData({});
            setResults(result);
        } catch (err: any) {
            setError(err.message || "Failed to add sample data");
        } finally {
            setLoading(false);
        }
    };

    const handleAddIndividual = async (type: string) => {
        setLoading(true);
        setError(null);

        try {
            let result;
            switch (type) {
                case 'policies':
                    result = await addSamplePolicies({});
                    break;
                case 'training':
                    result = await addSampleTraining({});
                    break;
                case 'quizzes':
                    result = await addSampleQuizzes({});
                    break;
                case 'links':
                    result = await linkQuizzesToTraining({});
                    break;
                default:
                    throw new Error("Unknown data type");
            }
            setResults({ [type]: result });
        } catch (err: any) {
            setError(err.message || `Failed to add ${type}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Sample Data Generator</h1>
                    <p className="text-muted-foreground">
                        Add demo content to test your SecureAware platform
                    </p>
                </div>
                <Badge variant="outline" className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Demo Content
                </Badge>
            </div>

            {/* Quick Setup */}
            <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        Quick Setup
                    </CardTitle>
                    <CardDescription>
                        Add all sample data at once to get started quickly
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={handleAddAllData}
                        disabled={loading}
                        size="lg"
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding Sample Data...
                            </>
                        ) : (
                            <>
                                <Database className="mr-2 h-4 w-4" />
                                Add All Sample Data
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            <Separator />

            {/* Individual Data Types */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            Policies
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                            4 comprehensive security policies including password, data protection, and incident response guidelines.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => handleAddIndividual('policies')}
                            disabled={loading}
                            className="w-full"
                        >
                            Add Policies
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-blue-600" />
                            Training
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                            6 training modules covering cybersecurity fundamentals, password security, phishing awareness, and more.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => handleAddIndividual('training')}
                            disabled={loading}
                            className="w-full"
                        >
                            Add Training
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-purple-600" />
                            Quizzes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                            5 interactive quizzes with multiple-choice questions testing cybersecurity knowledge and best practices.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => handleAddIndividual('quizzes')}
                            disabled={loading}
                            className="w-full"
                        >
                            Add Quizzes
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4 text-orange-600" />
                            Link Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                            Connect quizzes to their corresponding training modules for a complete learning experience.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => handleAddIndividual('links')}
                            disabled={loading}
                            className="w-full"
                        >
                            Link Content
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Results */}
            {results && (
                <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="h-5 w-5" />
                            Success!
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="text-sm bg-white p-4 rounded border overflow-auto">
                            {JSON.stringify(results, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}

            {/* Error */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            {/* Information */}
            <Card>
                <CardHeader>
                    <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <h4 className="font-semibold mb-2">📋 Security Policies</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Acceptable Use Policy</li>
                                <li>• Password Policy</li>
                                <li>• Data Classification & Handling</li>
                                <li>• Incident Response Policy</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">🎓 Training Modules</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Introduction to Cybersecurity</li>
                                <li>• Password Security Best Practices</li>
                                <li>• Recognizing Phishing Attacks</li>
                                <li>• Data Protection Guidelines</li>
                                <li>• Mobile Device Security</li>
                                <li>• Remote Work Security</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">❓ Interactive Quizzes</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Cybersecurity Fundamentals (4 questions)</li>
                                <li>• Password Security (4 questions)</li>
                                <li>• Phishing Awareness (4 questions)</li>
                                <li>• Data Protection (4 questions)</li>
                                <li>• Incident Response (4 questions)</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">🔗 Features</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Real YouTube training videos</li>
                                <li>• Official CISA documentation</li>
                                <li>• Multiple-choice questions</li>
                                <li>• Progress tracking ready</li>
                                <li>• Admin management enabled</li>
                                <li>• Employee training flow</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}