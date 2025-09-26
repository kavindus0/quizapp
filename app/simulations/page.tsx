"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
    Shield,
    Mail,
    Phone,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Play,
    RotateCcw,
    Trophy,
    Clock,
    Target,
    Eye,
    Zap
} from "lucide-react";

interface SimulationScenario {
    id: string;
    title: string;
    type: "phishing_email" | "social_engineering_call" | "physical_security" | "data_handling";
    difficulty: "beginner" | "intermediate" | "advanced";
    description: string;
    scenario: string;
    options: Array<{
        id: string;
        text: string;
        correct: boolean;
        explanation: string;
    }>;
    redFlags: string[];
    tips: string[];
}

const simulationScenarios: SimulationScenario[] = [
    {
        id: "phishing-bank-update",
        title: "Suspicious Banking Email",
        type: "phishing_email",
        difficulty: "beginner",
        description: "A customer receives an urgent email about their account. How should you respond?",
        scenario: `From: security@royal-credit-recovery.com
To: customer@example.com
Subject: URGENT: Account Verification Required - Act Now!

Dear Valued Customer,

We have detected unusual activity on your Royal Credit Recoveries account. For your security, we need you to verify your account information immediately.

Please click here to verify your account: http://bit.ly/rcr-verify-now

You have 24 hours to complete this verification or your account will be suspended.

If you have any questions, please do not hesitate to contact us at this email address.

Best regards,
Security Team
Royal Credit Recoveries Ltd.`,
        options: [
            {
                id: "forward-customer",
                text: "Forward the email to the customer asking them to verify their information",
                correct: false,
                explanation: "Never forward suspicious emails. This could put the customer at risk."
            },
            {
                id: "click-verify",
                text: "Click the link to see if it's legitimate before advising the customer",
                correct: false,
                explanation: "Never click suspicious links, even to test them. This could compromise your system."
            },
            {
                id: "report-phishing",
                text: "Report this as a phishing attempt and advise the customer not to click any links",
                correct: true,
                explanation: "Correct! This email has multiple red flags indicating it's a phishing attempt."
            },
            {
                id: "ignore-email",
                text: "Ignore the email since it's not addressed to you",
                correct: false,
                explanation: "You should always report suspicious emails to protect customers and the company."
            }
        ],
        redFlags: [
            "Urgent language with time pressure",
            "Suspicious email domain (hyphen in company name)",
            "Shortened URL (bit.ly) instead of official domain",
            "Generic greeting 'Dear Valued Customer'",
            "Requests for account verification via email"
        ],
        tips: [
            "Always verify the sender's email domain carefully",
            "Be suspicious of urgent requests for action",
            "Never click on shortened URLs in emails",
            "When in doubt, report to the security team"
        ]
    },
    {
        id: "social-engineering-call",
        title: "Impersonation Phone Call",
        type: "social_engineering_call",
        difficulty: "intermediate",
        description: "You receive a call from someone claiming to be from IT support. What do you do?",
        scenario: `CALLER: "Hello, this is Mike from IT Support. We're experiencing some network issues and I need to verify your login credentials to ensure your account hasn't been compromised. Can you please provide me with your username and current password so I can check your account status?"

YOU: "I wasn't aware of any network issues..."

CALLER: "Yes, it's affecting several departments. We're trying to resolve it quickly to minimize downtime. This is urgent - if I can't verify your credentials now, we may need to disable your account as a security precaution until tomorrow. I just need your username and password to run a quick security check."`,
        options: [
            {
                id: "provide-credentials",
                text: "Provide your username and password since it's IT support",
                correct: false,
                explanation: "Never provide credentials over the phone, even to claimed IT staff."
            },
            {
                id: "hang-up-verify",
                text: "Politely decline, hang up, and call IT directly to verify",
                correct: true,
                explanation: "Correct! Always verify the caller's identity through official channels."
            },
            {
                id: "provide-username-only",
                text: "Give only your username but refuse to share your password",
                correct: false,
                explanation: "Don't provide any credentials over the phone, even usernames can be valuable to attackers."
            },
            {
                id: "ask-for-id",
                text: "Ask for their employee ID and department before sharing information",
                correct: false,
                explanation: "Attackers can easily fake employee IDs. Always verify through official channels."
            }
        ],
        redFlags: [
            "Unsolicited call requesting credentials",
            "Urgency and pressure tactics",
            "Threat of account suspension",
            "No prior notification of network issues",
            "Request for password over phone"
        ],
        tips: [
            "IT will never ask for passwords over the phone",
            "Always verify caller identity through official numbers",
            "Be suspicious of urgent requests for credentials",
            "When in doubt, escalate to your supervisor"
        ]
    },
    {
        id: "data-handling-customer",
        title: "Customer Data Request",
        type: "data_handling",
        difficulty: "advanced",
        description: "A caller claims to be a customer's lawyer requesting sensitive information. How do you handle this?",
        scenario: `CALLER: "Good afternoon, I'm Sarah Johnson, legal counsel for Mr. David Smith, one of your customers. I'm calling regarding a legal matter and need to obtain his complete account history, payment records, and call recordings from the past two years. This is for ongoing litigation and I need this information by end of business today. Mr. Smith has authorized me to collect this information on his behalf."

The caller provides what appears to be correct account details and knows some information about recent transactions.`,
        options: [
            {
                id: "provide-information",
                text: "Provide the information since they have account details and claim authorization",
                correct: false,
                explanation: "Never provide sensitive information without proper authorization and verification procedures."
            },
            {
                id: "request-written-authorization",
                text: "Request written authorization from the customer and follow proper legal disclosure procedures",
                correct: true,
                explanation: "Correct! Always follow formal procedures for legal requests and verify authorization."
            },
            {
                id: "transfer-supervisor",
                text: "Transfer the call to your supervisor without providing any information",
                correct: false,
                explanation: "While escalation is good, you should first inform them of the proper procedures."
            },
            {
                id: "schedule-callback",
                text: "Schedule a callback after verifying the lawyer's credentials online",
                correct: false,
                explanation: "Even with verification, you must follow formal legal disclosure procedures."
            }
        ],
        redFlags: [
            "Urgent timeline for sensitive information",
            "Verbal authorization claims",
            "No formal legal documentation",
            "Pressure to provide information immediately",
            "Unsolicited call requesting sensitive data"
        ],
        tips: [
            "All legal requests must go through formal channels",
            "Never provide sensitive data without written authorization",
            "Customer consent must be documented and verified",
            "Legal requests require supervisor approval and documentation"
        ]
    }
];

interface SimulationResultsProps {
    scenario: SimulationScenario;
    selectedOption: string;
    onRetry: () => void;
    onNext: () => void;
}

function SimulationResults({ scenario, selectedOption, onRetry, onNext }: SimulationResultsProps) {
    const selectedAnswer = scenario.options.find(opt => opt.id === selectedOption);
    const isCorrect = selectedAnswer?.correct || false;

    return (
        <div className="space-y-6">
            <div className="text-center">
                {isCorrect ? (
                    <div className="flex flex-col items-center space-y-2">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                        <h3 className="text-2xl font-bold text-green-700">Well Done!</h3>
                        <p className="text-green-600">You correctly identified the security threat.</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-2">
                        <XCircle className="h-16 w-16 text-red-500" />
                        <h3 className="text-2xl font-bold text-red-700">Let's Learn from This</h3>
                        <p className="text-red-600">This wasn't the best choice, but that's how we learn!</p>
                    </div>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Answer</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}>
                        <p className="font-medium mb-2">{selectedAnswer?.text}</p>
                        <p className="text-sm">{selectedAnswer?.explanation}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Red Flags to Watch For</CardTitle>
                    <CardDescription>Key indicators that this was a security threat</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {scenario.redFlags.map((flag, index) => (
                            <li key={index} className="flex items-start space-x-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{flag}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Security Tips</CardTitle>
                    <CardDescription>Remember these best practices</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {scenario.tips.map((tip, index) => (
                            <li key={index} className="flex items-start space-x-2">
                                <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{tip}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <div className="flex space-x-4">
                <Button onClick={onRetry} variant="outline" className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                </Button>
                <Button onClick={onNext} className="flex-1">
                    Next Simulation
                    <Target className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}

export default function SecuritySimulations() {
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [showResults, setShowResults] = useState(false);
    const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set());
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [simulationStartTime, setSimulationStartTime] = useState<Date>(new Date());

    // Convex hooks
    const simulationStats = useQuery(api.simulations.getSimulationStats);
    const recordAttempt = useMutation(api.simulations.recordSimulationAttempt);

    const currentScenario = simulationScenarios[currentScenarioIndex];

    useEffect(() => {
        setSimulationStartTime(new Date());
    }, [currentScenarioIndex]);

    const handleOptionSelect = (optionId: string) => {
        setSelectedOption(optionId);
    };

    const handleSubmit = async () => {
        if (!selectedOption) return;

        const selectedAnswer = currentScenario.options.find(opt => opt.id === selectedOption);
        const isCorrect = selectedAnswer?.correct || false;
        const timeSpent = Math.floor((new Date().getTime() - simulationStartTime.getTime()) / 1000);

        // Record the attempt
        try {
            await recordAttempt({
                scenarioId: currentScenario.id,
                selectedOption,
                isCorrect,
                timeSpent,
                difficulty: currentScenario.difficulty
            });
        } catch (error) {
            console.error("Failed to record simulation attempt:", error);
        }

        if (isCorrect) {
            setCorrectAnswers(prev => prev + 1);
        }

        setCompletedScenarios(prev => new Set(prev).add(currentScenario.id));
        setShowResults(true);
    };

    const handleRetry = () => {
        setSelectedOption("");
        setShowResults(false);
        setSimulationStartTime(new Date());
    };

    const handleNext = () => {
        if (currentScenarioIndex < simulationScenarios.length - 1) {
            setCurrentScenarioIndex(prev => prev + 1);
            setSelectedOption("");
            setShowResults(false);
        } else {
            // Completed all scenarios
            alert(`Simulation Complete! You got ${correctAnswers + (currentScenario.options.find(opt => opt.id === selectedOption)?.correct ? 1 : 0)} out of ${simulationScenarios.length} correct.`);
        }
    };

    const getScenarioIcon = (type: string) => {
        switch (type) {
            case "phishing_email":
                return Mail;
            case "social_engineering_call":
                return Phone;
            case "physical_security":
                return Shield;
            case "data_handling":
                return Eye;
            default:
                return AlertTriangle;
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "beginner":
                return "bg-green-100 text-green-800";
            case "intermediate":
                return "bg-yellow-100 text-yellow-800";
            case "advanced":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const progressPercentage = ((currentScenarioIndex + (showResults ? 1 : 0)) / simulationScenarios.length) * 100;
    const ScenarioIcon = getScenarioIcon(currentScenario.type);

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold flex items-center justify-center space-x-3">
                    <Zap className="h-8 w-8 text-orange-500" />
                    <span>Security Simulations</span>
                </h1>
                <p className="text-muted-foreground">
                    Practice recognizing and responding to real-world security threats in a safe environment
                </p>
            </div>

            {/* Progress and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Current Session Progress</span>
                            <span className="text-sm text-muted-foreground">
                                {currentScenarioIndex + (showResults ? 1 : 0)} of {simulationScenarios.length}
                            </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                    </CardContent>
                </Card>

                {simulationStats && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">{simulationStats.totalAttempts}</div>
                                    <div className="text-xs text-muted-foreground">Total Attempts</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{simulationStats.accuracyRate}%</div>
                                    <div className="text-xs text-muted-foreground">Accuracy Rate</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-purple-600">{simulationStats.completedScenarios.length}</div>
                                    <div className="text-xs text-muted-foreground">Scenarios Tried</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Current Simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Scenario Details */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <ScenarioIcon className="h-5 w-5 text-blue-600" />
                                <span>Scenario Details</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Badge className={getDifficultyColor(currentScenario.difficulty)}>
                                    {currentScenario.difficulty}
                                </Badge>
                            </div>
                            <div>
                                <h3 className="font-medium">{currentScenario.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {currentScenario.description}
                                </p>
                            </div>
                            <div className="pt-2 border-t">
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Estimated time: 3-5 minutes</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tips Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Target className="h-5 w-5 text-green-600" />
                                <span>Quick Tips</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start space-x-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>Read the scenario carefully</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>Look for red flags and suspicious elements</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>Consider company policies and procedures</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>When in doubt, choose the safest option</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Simulation Area */}
                <div className="lg:col-span-2">
                    <Card className="min-h-96">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{currentScenario.title}</span>
                                <Badge variant="outline">
                                    Scenario {currentScenarioIndex + 1}
                                </Badge>
                            </CardTitle>
                            <CardDescription>{currentScenario.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!showResults ? (
                                <div className="space-y-6">
                                    {/* Scenario Content */}
                                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                                        <h4 className="font-medium mb-2">Scenario:</h4>
                                        <div className="text-sm whitespace-pre-line">{currentScenario.scenario}</div>
                                    </div>

                                    {/* Options */}
                                    <div className="space-y-3">
                                        <h4 className="font-medium">How would you handle this situation?</h4>
                                        {currentScenario.options.map((option) => (
                                            <div
                                                key={option.id}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedOption === option.id
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                    }`}
                                                onClick={() => handleOptionSelect(option.id)}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${selectedOption === option.id
                                                            ? "border-blue-500 bg-blue-500"
                                                            : "border-gray-300"
                                                        }`}>
                                                        {selectedOption === option.id && (
                                                            <div className="w-full h-full bg-white rounded-full scale-50"></div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm">{option.text}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4">
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={!selectedOption}
                                            className="w-full"
                                        >
                                            Submit Answer
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <SimulationResults
                                    scenario={currentScenario}
                                    selectedOption={selectedOption}
                                    onRetry={handleRetry}
                                    onNext={handleNext}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}