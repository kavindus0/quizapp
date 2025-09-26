"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Search,
    HelpCircle,
    BookOpen,
    Shield,
    Phone,
    Mail,
    FileText,
    Users,
    Clock,
    Star,
    ThumbsUp,
    ChevronDown,
    ChevronRight,
    Filter,
    Tag
} from "lucide-react";

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    tags: string[];
    isActive: boolean;
    order: number;
    helpful: number;
    createdAt: number;
    updatedAt: number;
}

const faqCategories = [
    { id: "all", name: "All Questions", icon: HelpCircle, color: "text-gray-600" },
    { id: "security", name: "Security & 2FA", icon: Shield, color: "text-blue-600" },
    { id: "training", name: "Training & Learning", icon: BookOpen, color: "text-green-600" },
    { id: "policies", name: "Company Policies", icon: FileText, color: "text-purple-600" },
    { id: "technical", name: "Technical Support", icon: Phone, color: "text-orange-600" },
    { id: "compliance", name: "Compliance", icon: Users, color: "text-red-600" },
    { id: "data-protection", name: "Data Protection", icon: Mail, color: "text-indigo-600" }
];

const popularTags = [
    "password", "2fa", "phishing", "pci-dss", "training", "certificates",
    "policies", "data-breach", "incident", "compliance", "customer-data", "call-recording"
];

export default function FAQSystem() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

    // Mock FAQ data - would come from Convex in real implementation
    const [faqs] = useState<FAQ[]>([
        {
            id: "1",
            question: "How do I enable Two-Factor Authentication (2FA)?",
            answer: `To enable 2FA on your Royal Credit Recoveries account:
      
1. Go to your Profile page
2. Click on "Security Settings"
3. Select "Enable Two-Factor Authentication"
4. Scan the QR code with Google Authenticator or similar app
5. Enter the verification code to confirm
6. Save your backup codes in a secure location

Important: Keep your backup codes safe - you'll need them if you lose access to your authenticator app.`,
            category: "security",
            tags: ["2fa", "security", "authentication", "profile"],
            isActive: true,
            order: 1,
            helpful: 28,
            createdAt: Date.now() - 1000000,
            updatedAt: Date.now() - 500000
        },
        {
            id: "2",
            question: "What should I do if I receive a suspicious email claiming to be from the bank?",
            answer: `If you receive a suspicious email:

1. DO NOT click any links or download attachments
2. DO NOT provide any personal or customer information
3. Forward the email to security@royalcreditrecoveries.com
4. Delete the email from your inbox
5. Report the incident to your supervisor

Red flags to watch for:
• Urgent language or threats
• Misspelled company names or domains
• Requests for passwords or sensitive information
• Generic greetings like "Dear Customer"

When in doubt, always verify through official channels before taking any action.`,
            category: "security",
            tags: ["phishing", "email", "security", "incident"],
            isActive: true,
            order: 2,
            helpful: 45,
            createdAt: Date.now() - 2000000,
            updatedAt: Date.now() - 800000
        },
        {
            id: "3",
            question: "How often do I need to complete security training?",
            answer: `Security training requirements:

• Annual training is mandatory for all employees
• New employees must complete initial training within 30 days
• Role-specific training may be required more frequently
• Additional training may be assigned based on incidents or updates

You'll receive email notifications when training is due. Check your dashboard for current training status and deadlines.

Failure to complete training on time may result in temporary system access restrictions.`,
            category: "training",
            tags: ["training", "compliance", "mandatory", "deadlines"],
            isActive: true,
            order: 3,
            helpful: 32,
            createdAt: Date.now() - 3000000,
            updatedAt: Date.now() - 1000000
        },
        {
            id: "4",
            question: "What is PCI DSS and why is it important for our company?",
            answer: `PCI DSS (Payment Card Industry Data Security Standard) is a set of security standards designed to ensure that companies that accept, process, store, or transmit credit card information maintain secure environments.

For Royal Credit Recoveries:
• We handle customer payment information daily
• Compliance is legally required for our operations
• Non-compliance can result in heavy fines and loss of processing privileges
• Protects both the company and our customers

Key PCI DSS requirements include:
• Secure network and systems
• Protect cardholder data
• Maintain vulnerability management
• Implement strong access control
• Regular security monitoring and testing

All employees handling payment data must complete PCI DSS training annually.`,
            category: "compliance",
            tags: ["pci-dss", "compliance", "payment-data", "regulations"],
            isActive: true,
            order: 4,
            helpful: 38,
            createdAt: Date.now() - 4000000,
            updatedAt: Date.now() - 1200000
        },
        {
            id: "5",
            question: "How should I handle a customer who asks for their call recording?",
            answer: `When a customer requests their call recording:

1. Verify the customer's identity using standard procedures
2. Check if the request is for their own recordings only
3. Follow the formal data request process:
   • Log the request in the system
   • Notify your supervisor
   • Complete the data request form
   • Obtain necessary approvals

Important: Never provide recordings immediately over the phone. All requests must go through proper channels and documentation.

Legal requirements:
• Customer has right to access their data under data protection laws
• Requests must be processed within 30 days
• Identity verification is mandatory
• Proper audit trail must be maintained`,
            category: "data-protection",
            tags: ["call-recording", "customer-data", "data-requests", "legal"],
            isActive: true,
            order: 5,
            helpful: 29,
            createdAt: Date.now() - 5000000,
            updatedAt: Date.now() - 1500000
        },
        {
            id: "6",
            question: "What should I do if I suspect a security incident?",
            answer: `If you suspect a security incident:

IMMEDIATE ACTIONS:
1. Stop what you're doing immediately
2. Do not try to "fix" or investigate yourself
3. Disconnect from the network if you suspect malware
4. Contact IT Security immediately (Internal: 2401)

REPORTING PROCESS:
• Call the Security Team: +94 11 XXX XXXX (Internal: 2401)
• Email: security@royalcreditrecoveries.com
• Use the incident reporting form on the intranet
• Notify your direct supervisor

INFORMATION TO PROVIDE:
• What happened and when
• Systems or data potentially affected
• Actions you took before reporting
• Your contact information

Remember: It's better to report a false alarm than miss a real incident. You will never be penalized for reporting suspicious activity.`,
            category: "security",
            tags: ["incident", "security-breach", "reporting", "emergency"],
            isActive: true,
            order: 6,
            helpful: 41,
            createdAt: Date.now() - 6000000,
            updatedAt: Date.now() - 1800000
        },
        {
            id: "7",
            question: "Can I access training materials from home?",
            answer: `Yes, you can access training materials remotely:

REQUIREMENTS:
• Use your company credentials to log in
• Ensure 2FA is enabled on your account
• Use a secure, private network (avoid public WiFi)
• Keep your device secure and updated

BEST PRACTICES:
• Complete training in a private space
• Don't save company materials on personal devices
• Log out completely when finished
• Report any access issues immediately

RESTRICTIONS:
• Some sensitive modules may be office-only
• Quiz attempts are monitored for integrity
• All access is logged for compliance

Technical issues? Contact training@royalcreditrecoveries.com or call Internal: 2501.`,
            category: "training",
            tags: ["remote-access", "training", "home-office", "security"],
            isActive: true,
            order: 7,
            helpful: 22,
            createdAt: Date.now() - 7000000,
            updatedAt: Date.now() - 2000000
        },
        {
            id: "8",
            question: "What information can I share with third parties?",
            answer: `Information sharing guidelines:

NEVER SHARE:
• Customer passwords or PINs
• Complete payment card numbers
• Social security numbers or ID numbers
• Account balances without proper authorization
• Internal system information or procedures

REQUIRES AUTHORIZATION:
• Account status information
• Payment history
• Contact information updates
• Debt details

PROPER CHANNELS FOR THIRD PARTIES:
• Legal requests must go through compliance team
• Authorized representatives need proper documentation
• Collection agencies have specific data sharing agreements
• All sharing must be logged and documented

When in doubt:
1. Ask for written authorization
2. Verify the third party's legitimacy
3. Consult your supervisor
4. Document all interactions`,
            category: "data-protection",
            tags: ["data-sharing", "third-parties", "customer-data", "authorization"],
            isActive: true,
            order: 8,
            helpful: 35,
            createdAt: Date.now() - 8000000,
            updatedAt: Date.now() - 2200000
        }
    ]);

    // Filter FAQs based on search, category, and tags
    const filteredFAQs = faqs.filter(faq => {
        const matchesSearch = searchQuery === "" ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;

        const matchesTags = selectedTags.length === 0 ||
            selectedTags.some(tag => faq.tags.includes(tag));

        return matchesSearch && matchesCategory && matchesTags;
    }).sort((a, b) => {
        // Sort by helpful count (most helpful first), then by order
        if (b.helpful !== a.helpful) return b.helpful - a.helpful;
        return a.order - b.order;
    });

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const toggleFAQ = (faqId: string) => {
        setExpandedFAQ(prev => prev === faqId ? null : faqId);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold flex items-center justify-center space-x-3">
                    <HelpCircle className="h-8 w-8 text-blue-600" />
                    <span>Frequently Asked Questions</span>
                </h1>
                <p className="text-muted-foreground">
                    Find quick answers to common security and compliance questions
                </p>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search questions, answers, or tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Category Filters */}
                    <div>
                        <h3 className="text-sm font-medium mb-3 flex items-center space-x-2">
                            <Filter className="h-4 w-4" />
                            <span>Categories</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {faqCategories.map(category => {
                                const Icon = category.icon;
                                const isSelected = selectedCategory === category.id;
                                return (
                                    <Button
                                        key={category.id}
                                        variant={isSelected ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedCategory(category.id)}
                                        className="flex items-center space-x-2"
                                    >
                                        <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : category.color}`} />
                                        <span>{category.name}</span>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tag Filters */}
                    <div>
                        <h3 className="text-sm font-medium mb-3 flex items-center space-x-2">
                            <Tag className="h-4 w-4" />
                            <span>Popular Tags</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {popularTags.map(tag => (
                                <Badge
                                    key={tag}
                                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                                    className="cursor-pointer hover:bg-primary/80"
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(selectedCategory !== "all" || selectedTags.length > 0) && (
                        <div className="flex items-center space-x-2 pt-2 border-t">
                            <span className="text-sm text-muted-foreground">Active filters:</span>
                            {selectedCategory !== "all" && (
                                <Badge variant="secondary">
                                    Category: {faqCategories.find(c => c.id === selectedCategory)?.name}
                                </Badge>
                            )}
                            {selectedTags.map(tag => (
                                <Badge key={tag} variant="secondary">
                                    Tag: {tag}
                                </Badge>
                            ))}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedCategory("all");
                                    setSelectedTags([]);
                                }}
                            >
                                Clear all
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''} found
                </p>
                {searchQuery && (
                    <p className="text-sm text-muted-foreground">
                        Searching for: <strong>"{searchQuery}"</strong>
                    </p>
                )}
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
                {filteredFAQs.length > 0 ? (
                    filteredFAQs.map(faq => {
                        const isExpanded = expandedFAQ === faq.id;
                        const categoryInfo = faqCategories.find(c => c.id === faq.category);
                        const CategoryIcon = categoryInfo?.icon || HelpCircle;

                        return (
                            <Card key={faq.id} className="transition-all hover:shadow-md">
                                <CardContent className="p-0">
                                    <div
                                        className="p-6 cursor-pointer"
                                        onClick={() => toggleFAQ(faq.id)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <CategoryIcon className={`h-4 w-4 ${categoryInfo?.color || 'text-gray-600'}`} />
                                                    <Badge variant="outline" className="text-xs">
                                                        {categoryInfo?.name || faq.category}
                                                    </Badge>
                                                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                                        <ThumbsUp className="h-3 w-3" />
                                                        <span>{faq.helpful} helpful</span>
                                                    </div>
                                                </div>
                                                <h3 className="font-medium text-lg mb-2">{faq.question}</h3>
                                                <div className="flex flex-wrap gap-1">
                                                    {faq.tags.map(tag => (
                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                {isExpanded ? (
                                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-6 pb-6 border-t">
                                            <div className="pt-4">
                                                <div className="prose prose-sm max-w-none">
                                                    <div className="whitespace-pre-line text-sm text-gray-700">
                                                        {faq.answer}
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <Button variant="outline" size="sm">
                                                            <ThumbsUp className="h-3 w-3 mr-1" />
                                                            Helpful ({faq.helpful})
                                                        </Button>
                                                        <span className="text-xs text-muted-foreground">
                                                            Last updated: {new Date(faq.updatedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No FAQs Found</h3>
                            <p className="text-muted-foreground mb-4">
                                Try adjusting your search terms or filters to find what you're looking for.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory("all");
                                    setSelectedTags([]);
                                }}
                            >
                                Clear all filters
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Help Footer */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                        <h3 className="font-medium">Can't find what you're looking for?</h3>
                        <p className="text-sm text-muted-foreground">
                            Contact our support team for personalized help with your security questions.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 mt-4">
                            <Button variant="outline" size="sm">
                                <Mail className="h-4 w-4 mr-2" />
                                Email Support
                            </Button>
                            <Button variant="outline" size="sm">
                                <Phone className="h-4 w-4 mr-2" />
                                Call Support
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}