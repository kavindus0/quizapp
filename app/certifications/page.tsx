"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Award,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    ExternalLink,
    Shield,
    Star,
    AlertTriangle,
    FileText,
    Users,
    Zap
} from "lucide-react";

export const dynamic = 'force-dynamic';

interface Certification {
    _id: string;
    title: string;
    description: string;
    category: string;
    certificateType: string;
    issuedAt: number;
    expiresAt?: number;
    status: string;
    certificateId: string;
    verificationCode: string;
    creditsEarned?: number;
    metadata?: {
        finalScore?: number;
        timeToComplete?: number;
        specialNotes?: string;
    };
}

export default function CertificationsPage() {
    const { user, isLoaded } = useUser();
    const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
    const [showVerificationDialog, setShowVerificationDialog] = useState(false);

    // Get the current user from Convex
    const currentUser = useQuery(api.users.getCurrentUser);

    const certifications = useQuery(
        api.certifications.getUserCertifications,
        currentUser ? { userId: currentUser.clerkId } : "skip"
    ) as Certification[] | undefined;

    const templates = useQuery(api.certifications.getCertificationTemplates);

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, any> = {
            "data_protection": Shield,
            "pci_compliance": Award,
            "call_security": FileText,
            "fraud_prevention": AlertTriangle,
            "general_security": Star,
            "compliance": CheckCircle
        };
        return icons[category] || Award;
    };

    const getCategoryDisplayName = (category: string) => {
        const categories: Record<string, string> = {
            "data_protection": "Data Protection",
            "pci_compliance": "PCI DSS Compliance",
            "call_security": "Call Security",
            "fraud_prevention": "Fraud Prevention",
            "general_security": "General Security",
            "compliance": "Compliance"
        };
        return categories[category] || category;
    };

    const getStatusBadge = (cert: Certification) => {
        const now = Date.now();
        const isExpired = cert.expiresAt && cert.expiresAt < now;
        const isExpiringSoon = cert.expiresAt && cert.expiresAt < now + (30 * 24 * 60 * 60 * 1000);

        if (cert.status === "revoked") {
            return <Badge variant="destructive">Revoked</Badge>;
        }
        if (isExpired) {
            return <Badge variant="secondary">Expired</Badge>;
        }
        if (isExpiringSoon) {
            return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Expires Soon</Badge>;
        }
        return <Badge variant="default">Active</Badge>;
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <CardTitle>Sign In Required</CardTitle>
                            <CardDescription>
                                Please sign in to view your certifications and track your progress.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        );
    }

    const activeCerts = certifications?.filter(c => c.status === "active") || [];
    const expiredCerts = certifications?.filter(c => {
        const now = Date.now();
        return c.status === "expired" || (c.expiresAt && c.expiresAt < now);
    }) || [];

    const expiringSoon = activeCerts.filter(c => {
        const now = Date.now();
        return c.expiresAt && c.expiresAt < now + (30 * 24 * 60 * 60 * 1000);
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center space-x-2">
                        <Award className="h-8 w-8 text-yellow-600" />
                        <span>My Certifications</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Track your security training certifications and compliance status
                    </p>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4 text-yellow-600" />
                            <div>
                                <p className="text-sm font-medium">Total Earned</p>
                                <p className="text-2xl font-bold">{certifications?.length || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                                <p className="text-sm font-medium">Active</p>
                                <p className="text-2xl font-bold">{activeCerts.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <div>
                                <p className="text-sm font-medium">Expiring Soon</p>
                                <p className="text-2xl font-bold">{expiringSoon.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium">Credits Earned</p>
                                <p className="text-2xl font-bold">
                                    {certifications?.reduce((sum, cert) => sum + (cert.creditsEarned || 0), 0) || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Certifications Display */}
            <Tabs defaultValue="earned" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="earned">Earned Certificates</TabsTrigger>
                    <TabsTrigger value="available">Available Certificates</TabsTrigger>
                    <TabsTrigger value="expired">Expired</TabsTrigger>
                </TabsList>

                <TabsContent value="earned" className="space-y-4">
                    {activeCerts.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center h-32 space-y-2">
                                <Award className="h-12 w-12 text-gray-400" />
                                <p className="text-muted-foreground">No active certifications yet.</p>
                                <p className="text-sm text-muted-foreground">Complete training modules to earn certificates!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {activeCerts.map((cert) => {
                                const CategoryIcon = getCategoryIcon(cert.category);
                                return (
                                    <Card key={cert._id} className="relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600" />
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <CategoryIcon className="h-5 w-5 text-yellow-600" />
                                                    <CardTitle className="text-lg">{cert.title}</CardTitle>
                                                </div>
                                                {getStatusBadge(cert)}
                                            </div>
                                            <CardDescription>{cert.description}</CardDescription>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="font-medium">Issued</p>
                                                    <p className="text-muted-foreground">{formatDate(cert.issuedAt)}</p>
                                                </div>
                                                {cert.expiresAt && (
                                                    <div>
                                                        <p className="font-medium">Expires</p>
                                                        <p className="text-muted-foreground">{formatDate(cert.expiresAt)}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {cert.metadata?.finalScore && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Final Score</span>
                                                    <Badge variant="outline">{cert.metadata.finalScore}%</Badge>
                                                </div>
                                            )}

                                            {cert.creditsEarned && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Credits Earned</span>
                                                    <Badge variant="outline">{cert.creditsEarned} CPE</Badge>
                                                </div>
                                            )}

                                            <Separator />

                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => setSelectedCert(cert)}
                                                >
                                                    <FileText className="h-4 w-4 mr-1" />
                                                    View Details
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowVerificationDialog(true)}
                                                >
                                                    <ExternalLink className="h-4 w-4 mr-1" />
                                                    Verify
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="available" className="space-y-4">
                    {templates?.length === 0 ? (
                        <Card>
                            <CardContent className="flex items-center justify-center h-32">
                                <p className="text-muted-foreground">No certification programs available.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {templates?.map((template) => {
                                const CategoryIcon = getCategoryIcon(template.category);
                                const alreadyEarned = certifications?.some(c =>
                                    c.title === template.title && c.status === "active"
                                );

                                return (
                                    <Card key={template._id} className={`${alreadyEarned ? 'opacity-60' : ''}`}>
                                        <CardHeader>
                                            <div className="flex items-center space-x-2">
                                                <CategoryIcon className="h-5 w-5 text-blue-600" />
                                                <CardTitle className="text-lg">{template.title}</CardTitle>
                                            </div>
                                            <CardDescription>{template.description}</CardDescription>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Category</span>
                                                <Badge variant="outline">{getCategoryDisplayName(template.category)}</Badge>
                                            </div>

                                            {template.minimumOverallScore && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Min. Score Required</span>
                                                    <Badge variant="outline">{template.minimumOverallScore}%</Badge>
                                                </div>
                                            )}

                                            {template.validityPeriod && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Validity Period</span>
                                                    <Badge variant="outline">{Math.floor(template.validityPeriod / 365)} year(s)</Badge>
                                                </div>
                                            )}

                                            {template.creditsAwarded && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Credits Awarded</span>
                                                    <Badge variant="outline">{template.creditsAwarded} CPE</Badge>
                                                </div>
                                            )}

                                            <Separator />

                                            <div className="text-sm text-muted-foreground">
                                                <p>Requirements:</p>
                                                <ul className="list-disc list-inside mt-1 space-y-1">
                                                    <li>{template.requiredModules.length} training modules</li>
                                                    <li>{template.requiredQuizzes.length} assessments</li>
                                                    {template.minimumOverallScore && (
                                                        <li>Minimum {template.minimumOverallScore}% average score</li>
                                                    )}
                                                </ul>
                                            </div>

                                            {alreadyEarned ? (
                                                <Badge variant="default" className="w-full justify-center">
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Already Earned
                                                </Badge>
                                            ) : (
                                                <Button variant="outline" className="w-full">
                                                    <Star className="h-4 w-4 mr-1" />
                                                    Start Progress
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="expired" className="space-y-4">
                    {expiredCerts.length === 0 ? (
                        <Card>
                            <CardContent className="flex items-center justify-center h-32">
                                <p className="text-muted-foreground">No expired certifications.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {expiredCerts.map((cert) => {
                                const CategoryIcon = getCategoryIcon(cert.category);
                                return (
                                    <Card key={cert._id} className="opacity-75">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <CategoryIcon className="h-5 w-5 text-gray-500" />
                                                    <CardTitle className="text-lg">{cert.title}</CardTitle>
                                                </div>
                                                <Badge variant="secondary">Expired</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-sm text-muted-foreground">
                                                <p>Expired: {cert.expiresAt ? formatDate(cert.expiresAt) : 'N/A'}</p>
                                                <p className="mt-2">Contact administrator to renew this certification.</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Certificate Details Dialog */}
            <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Award className="h-6 w-6 text-yellow-600" />
                            <span>{selectedCert?.title}</span>
                        </DialogTitle>
                        <DialogDescription>
                            Certificate Details and Verification Information
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCert && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Certificate ID</label>
                                    <p className="text-sm text-muted-foreground font-mono">{selectedCert.certificateId}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Verification Code</label>
                                    <p className="text-sm text-muted-foreground font-mono">{selectedCert.verificationCode}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Issued Date</label>
                                    <p className="text-sm text-muted-foreground">{formatDate(selectedCert.issuedAt)}</p>
                                </div>
                                {selectedCert.expiresAt && (
                                    <div>
                                        <label className="text-sm font-medium">Expiry Date</label>
                                        <p className="text-sm text-muted-foreground">{formatDate(selectedCert.expiresAt)}</p>
                                    </div>
                                )}
                            </div>

                            {selectedCert.metadata?.finalScore && (
                                <div>
                                    <label className="text-sm font-medium">Final Assessment Score</label>
                                    <p className="text-sm text-muted-foreground">{selectedCert.metadata.finalScore}%</p>
                                </div>
                            )}

                            {selectedCert.creditsEarned && (
                                <div>
                                    <label className="text-sm font-medium">Continuing Professional Education Credits</label>
                                    <p className="text-sm text-muted-foreground">{selectedCert.creditsEarned} CPE credits</p>
                                </div>
                            )}

                            <Separator />

                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <p className="text-sm text-muted-foreground mt-1">{selectedCert.description}</p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedCert(null)}>
                            Close
                        </Button>
                        <Button onClick={() => {
                            // TODO: Generate and download PDF certificate
                            alert("PDF certificate download would be implemented here");
                        }}>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Verification Dialog */}
            <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Certificate Verification</DialogTitle>
                        <DialogDescription>
                            Use this information to verify your certificate with third parties
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Third parties can verify your Royal Credit Recoveries security training certificates
                            by visiting our verification portal and entering your certificate details.
                        </p>

                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm font-medium">Verification Portal</p>
                            <p className="text-sm text-muted-foreground">https://verify.royalcreditrecoveries.com</p>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm font-medium">Your Verification Code</p>
                            <p className="text-sm text-muted-foreground font-mono">
                                {selectedCert?.verificationCode || "Select a certificate first"}
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowVerificationDialog(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}