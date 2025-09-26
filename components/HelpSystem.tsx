"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    HelpCircle,
    BookOpen,
    Shield,
    FileText,
    Award,
    Play,
    CheckCircle,
    Clock,
    Target,
    Lightbulb,
    Video,
    Download
} from "lucide-react";

interface HelpTopic {
    id: string;
    title: string;
    description: string;
    category: "getting-started" | "training" | "policies" | "certificates" | "security";
    difficulty: "beginner" | "intermediate" | "advanced";
    icon: React.ComponentType<any>;
    steps: string[];
}

const helpTopics: HelpTopic[] = [
    {
        id: "first-login",
        title: "Your First Login",
        description: "Learn how to navigate the security platform and complete your initial setup",
        category: "getting-started",
        difficulty: "beginner",
        icon: Shield,
        steps: [
            "Sign in with your company email address",
            "Complete your profile information",
            "Enable Two-Factor Authentication (2FA) for security",
            "Take the guided tour to familiarize yourself with the platform",
            "Start your first training module"
        ]
    },
    {
        id: "complete-training",
        title: "Completing Training Modules",
        description: "How to access, complete, and pass security training modules",
        category: "training",
        difficulty: "beginner",
        icon: BookOpen,
        steps: [
            "Navigate to the Training section from the main menu",
            "Select a training module to begin",
            "Read through all content carefully",
            "Take notes on important security concepts",
            "Complete the quiz at the end (70% required to pass)",
            "Review incorrect answers to learn from mistakes"
        ]
    },
    {
        id: "acknowledge-policies",
        title: "Acknowledging Company Policies",
        description: "How to review and acknowledge required security policies",
        category: "policies",
        difficulty: "beginner",
        icon: FileText,
        steps: [
            "Go to the Policies section",
            "Read each policy document thoroughly",
            "Ask questions if anything is unclear",
            "Click 'Acknowledge' when you understand the policy",
            "Keep track of policy updates and renewals"
        ]
    },
    {
        id: "earn-certificates",
        title: "Earning Security Certificates",
        description: "How to earn and maintain your security certifications",
        category: "certificates",
        difficulty: "intermediate",
        icon: Award,
        steps: [
            "Complete all required training modules",
            "Pass quizzes with scores of 70% or higher",
            "Review certification requirements in the Certificates section",
            "Certificates are awarded automatically upon meeting requirements",
            "Monitor expiration dates and complete renewals on time"
        ]
    },
    {
        id: "enable-2fa",
        title: "Setting Up Two-Factor Authentication",
        description: "Secure your account with two-factor authentication",
        category: "security",
        difficulty: "beginner",
        icon: Shield,
        steps: [
            "Go to your Profile page",
            "Click 'Enable Two-Factor Authentication'",
            "Scan the QR code with Google Authenticator or similar app",
            "Enter the verification code to confirm setup",
            "Save your backup codes in a secure location",
            "Test the 2FA system by signing out and back in"
        ]
    }
];

const faqData = [
    {
        question: "How often do I need to complete security training?",
        answer: "Security training must be completed annually. Some modules may require more frequent updates based on regulatory requirements or company policy changes.",
        category: "training"
    },
    {
        question: "What happens if I fail a quiz?",
        answer: "You can retake quizzes immediately. Review the training material again and focus on areas where you made mistakes. There's no limit on attempts.",
        category: "training"
    },
    {
        question: "How do I know which policies apply to my role?",
        answer: "Policies are automatically assigned based on your job role and department. Required policies will be highlighted and require acknowledgment.",
        category: "policies"
    },
    {
        question: "Can I access training materials offline?",
        answer: "Currently, all training materials require an internet connection. We recommend completing modules during work hours when you have reliable internet access.",
        category: "training"
    },
    {
        question: "Who can I contact if I have questions about security policies?",
        answer: "Contact the IT Security team or your supervisor for questions about security policies. You can also reach out to HR for general compliance questions.",
        category: "policies"
    },
    {
        question: "What should I do if I suspect a security incident?",
        answer: "Immediately report any suspected security incidents to the IT Security team. Do not attempt to investigate or resolve security issues yourself.",
        category: "security"
    }
];

interface HelpSystemProps {
    trigger?: React.ReactNode;
}

export function HelpSystem({ trigger }: HelpSystemProps) {
    const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
    const [activeTab, setActiveTab] = useState("tutorials");

    const defaultTrigger = (
        <Button variant="outline" size="sm">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help & Support
        </Button>
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Lightbulb className="h-5 w-5 text-blue-600" />
                        <span>Help & Support Center</span>
                    </DialogTitle>
                    <DialogDescription>
                        Find tutorials, guides, and answers to common questions about the Royal Credit Recoveries Security Platform.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
                        <TabsTrigger value="faq">FAQ</TabsTrigger>
                        <TabsTrigger value="contact">Contact Support</TabsTrigger>
                    </TabsList>

                    <TabsContent value="tutorials" className="space-y-4">
                        {selectedTopic ? (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <selectedTopic.icon className="h-6 w-6 text-blue-600" />
                                            <div>
                                                <CardTitle>{selectedTopic.title}</CardTitle>
                                                <CardDescription>{selectedTopic.description}</CardDescription>
                                            </div>
                                        </div>
                                        <Button variant="ghost" onClick={() => setSelectedTopic(null)}>
                                            Back to Tutorials
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex space-x-2">
                                            <Badge variant={selectedTopic.difficulty === "beginner" ? "default" : selectedTopic.difficulty === "intermediate" ? "secondary" : "destructive"}>
                                                {selectedTopic.difficulty}
                                            </Badge>
                                            <Badge variant="outline">{selectedTopic.category}</Badge>
                                        </div>

                                        <Alert>
                                            <Target className="h-4 w-4" />
                                            <AlertDescription>
                                                Follow these steps to complete this task successfully.
                                            </AlertDescription>
                                        </Alert>

                                        <div className="space-y-3">
                                            <h4 className="font-medium">Step-by-Step Guide:</h4>
                                            {selectedTopic.steps.map((step, index) => (
                                                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                                        {index + 1}
                                                    </div>
                                                    <p className="text-sm flex-1">{step}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {helpTopics.map((topic) => (
                                        <Card key={topic.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedTopic(topic)}>
                                            <CardHeader>
                                                <CardTitle className="flex items-center space-x-2 text-base">
                                                    <topic.icon className="h-5 w-5 text-blue-600" />
                                                    <span>{topic.title}</span>
                                                </CardTitle>
                                                <CardDescription className="text-sm">{topic.description}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex space-x-2">
                                                        <Badge variant="outline" className="text-xs">{topic.category}</Badge>
                                                        <Badge variant={topic.difficulty === "beginner" ? "default" : topic.difficulty === "intermediate" ? "secondary" : "destructive"} className="text-xs">
                                                            {topic.difficulty}
                                                        </Badge>
                                                    </div>
                                                    <Play className="h-4 w-4 text-gray-400" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <Alert>
                                    <Video className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>New to security training?</strong> We recommend starting with "Your First Login" and "Completing Training Modules" tutorials.
                                    </AlertDescription>
                                </Alert>
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="faq" className="space-y-4">
                        <div className="space-y-4">
                            {faqData.map((faq, index) => (
                                <Card key={index}>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center space-x-2">
                                            <HelpCircle className="h-4 w-4 text-blue-600" />
                                            <span>{faq.question}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700">{faq.answer}</p>
                                        <Badge variant="outline" className="mt-3 text-xs">{faq.category}</Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="contact" className="space-y-4">
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        <span>IT Security Team</span>
                                    </CardTitle>
                                    <CardDescription>For security-related questions and incident reporting</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Email:</strong> security@royalcreditrecoveries.com</p>
                                        <p><strong>Phone:</strong> +94 11 XXX XXXX (Internal: 2401)</p>
                                        <p><strong>Available:</strong> Monday - Friday, 8:00 AM - 6:00 PM</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <FileText className="h-5 w-5 text-green-600" />
                                        <span>HR Department</span>
                                    </CardTitle>
                                    <CardDescription>For general compliance and policy questions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Email:</strong> hr@royalcreditrecoveries.com</p>
                                        <p><strong>Phone:</strong> +94 11 XXX XXXX (Internal: 2301)</p>
                                        <p><strong>Available:</strong> Monday - Friday, 9:00 AM - 5:00 PM</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <BookOpen className="h-5 w-5 text-purple-600" />
                                        <span>Training Support</span>
                                    </CardTitle>
                                    <CardDescription>For help with training modules and technical issues</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Email:</strong> training@royalcreditrecoveries.com</p>
                                        <p><strong>Phone:</strong> +94 11 XXX XXXX (Internal: 2501)</p>
                                        <p><strong>Available:</strong> Monday - Friday, 8:00 AM - 5:00 PM</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Alert>
                                <Clock className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Emergency Security Incidents:</strong> For after-hours security emergencies, call the main office number and ask for the security duty officer.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

export default HelpSystem;