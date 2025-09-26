const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient(process.env.CONVEX_URL || "https://smooth-robin-948.convex.cloud");

async function populateSampleData() {
    console.log("Populating sample data...");

    try {
        // Create sample policies
        console.log("Creating sample policies...");
        const policy1 = await client.mutation("mutations:createPolicy", {
            title: "PCI DSS Data Protection Policy",
            content: `# PCI DSS Data Protection Policy

## Overview
This policy outlines the requirements for protecting cardholder data in accordance with PCI DSS standards.

## Key Requirements
- Never store sensitive authentication data after authorization
- Protect stored cardholder data
- Encrypt transmission of cardholder data across open, public networks
- Use and regularly update anti-virus software or programs`,
            category: "pci_compliance",
            createdBy: "system",
        });

        const policy2 = await client.mutation("mutations:createPolicy", {
            title: "Call Center Security Guidelines",
            content: `# Call Center Security Guidelines

## Phone Security
- Verify caller identity before sharing any information
- Never provide account details over unsecured channels
- Report suspicious calls immediately

## Data Handling
- Log all access to customer records
- Use secure workstations only
- Follow screen lock protocols`,
            category: "call_security",
            createdBy: "system",
        });

        // Create sample quizzes
        console.log("Creating sample quizzes...");
        const quiz1 = await client.mutation("mutations:createQuiz", {
            title: "PCI DSS Fundamentals Quiz",
            questions: [
                {
                    questionText: "What does PCI DSS stand for?",
                    options: [
                        "Payment Card Industry Data Security Standard",
                        "Personal Card Information Data Safety Standard",
                        "Payment Card International Data Security System",
                        "Personal Customer Information Data Security Standard"
                    ],
                    correctAnswerIndex: 0
                },
                {
                    questionText: "Which of the following is NOT allowed to be stored after authorization?",
                    options: [
                        "Primary Account Number (PAN)",
                        "Card Verification Value (CVV)",
                        "Cardholder Name",
                        "Expiration Date"
                    ],
                    correctAnswerIndex: 1
                },
                {
                    questionText: "How often should anti-virus definitions be updated?",
                    options: [
                        "Monthly",
                        "Weekly",
                        "Daily",
                        "Regularly as updates become available"
                    ],
                    correctAnswerIndex: 3
                }
            ]
        });

        const quiz2 = await client.mutation("mutations:createQuiz", {
            title: "Call Security Assessment",
            questions: [
                {
                    questionText: "What is the first step when receiving a call requesting account information?",
                    options: [
                        "Ask for their account number",
                        "Verify the caller's identity using security questions",
                        "Provide the information immediately",
                        "Transfer to supervisor"
                    ],
                    correctAnswerIndex: 1
                },
                {
                    questionText: "What should you do if a caller becomes aggressive when you ask for verification?",
                    options: [
                        "Give them the information to avoid conflict",
                        "Hang up immediately",
                        "Remain calm and explain the security policy",
                        "Provide partial information"
                    ],
                    correctAnswerIndex: 2
                }
            ]
        });

        // Create additional quizzes
        console.log("Creating additional quizzes...");
        const quiz3 = await client.mutation("mutations:createQuiz", {
            title: "Password Security Best Practices",
            questions: [
                {
                    questionText: "Which of the following is considered a strong password?",
                    options: [
                        "password123",
                        "MyP@ssw0rd2024!",
                        "admin",
                        "123456"
                    ],
                    correctAnswerIndex: 1
                },
                {
                    questionText: "How often should you change your password?",
                    options: [
                        "Only when required by the system",
                        "If you suspect it has been compromised",
                        "Never, unless you forget it",
                        "Every day"
                    ],
                    correctAnswerIndex: 1
                },
                {
                    questionText: "What is two-factor authentication?",
                    options: [
                        "Using two different passwords",
                        "An additional security layer requiring a second form of verification",
                        "Having two user accounts",
                        "Changing your password twice"
                    ],
                    correctAnswerIndex: 1
                }
            ]
        });

        const quiz4 = await client.mutation("mutations:createQuiz", {
            title: "Phishing Recognition and Prevention",
            questions: [
                {
                    questionText: "How can you verify if an email is legitimate?",
                    options: [
                        "Check if it has a professional appearance",
                        "Look for spelling and grammar errors only",
                        "Verify through a separate communication channel",
                        "Click on the links to test them"
                    ],
                    correctAnswerIndex: 2
                },
                {
                    questionText: "What should you do if you receive a suspicious email?",
                    options: [
                        "Forward it to all colleagues",
                        "Delete it immediately without reporting",
                        "Report it to the IT security team",
                        "Reply asking if it's legitimate"
                    ],
                    correctAnswerIndex: 2
                }
            ]
        });

        const quiz5 = await client.mutation("mutations:createQuiz", {
            title: "Data Classification Quiz",
            questions: [
                {
                    questionText: "What is the purpose of data classification?",
                    options: [
                        "Making files easier to find",
                        "Determining appropriate security measures",
                        "Reducing file sizes",
                        "Organizing alphabetically"
                    ],
                    correctAnswerIndex: 1
                },
                {
                    questionText: "How should confidential data be shared?",
                    options: [
                        "Through regular email",
                        "On a USB drive",
                        "By posting on company bulletin board",
                        "Using secure, encrypted channels"
                    ],
                    correctAnswerIndex: 3
                }
            ]
        });

        const quiz6 = await client.mutation("mutations:createQuiz", {
            title: "Incident Response Quiz",
            questions: [
                {
                    questionText: "What is the first step when you discover a security incident?",
                    options: [
                        "Try to fix it yourself",
                        "Ignore it if it seems minor",
                        "Immediately report it to the security team",
                        "Post about it on social media"
                    ],
                    correctAnswerIndex: 2
                },
                {
                    questionText: "Which of these is considered a security incident?",
                    options: [
                        "Receiving a suspicious email",
                        "Your computer running slowly",
                        "Unauthorized access to customer data",
                        "All of the above"
                    ],
                    correctAnswerIndex: 3
                }
            ]
        });

        // Create sample training modules
        console.log("Creating sample training modules...");
        const training1 = await client.mutation("mutations:createTrainingModule", {
            title: "PCI DSS Fundamentals Training",
            description: "Comprehensive training on Payment Card Industry Data Security Standards for Royal Credit Recoveries staff.",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/sample-pci-training",
            category: "pci_compliance",
            createdBy: "system",
            quizId: quiz1
        });

        const training2 = await client.mutation("mutations:createTrainingModule", {
            title: "Call Center Security Protocol",
            description: "Essential security protocols for handling customer calls and protecting sensitive information.",
            type: "document",
            contentUrl: "/training-materials/call-security-protocol.pdf",
            category: "call_security",
            createdBy: "system",
            quizId: quiz2
        });

        const training3 = await client.mutation("mutations:createTrainingModule", {
            title: "Fraud Detection and Prevention",
            description: "Learn to identify and prevent fraudulent activities in debt collection processes.",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/sample-fraud-training",
            category: "fraud_prevention",
            createdBy: "system"
        });

        const training4 = await client.mutation("mutations:createTrainingModule", {
            title: "Password Security Best Practices",
            description: "Learn how to create and manage secure passwords and use multi-factor authentication",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/sample-password-training",
            category: "security",
            createdBy: "system",
            quizId: quiz3
        });

        const training5 = await client.mutation("mutations:createTrainingModule", {
            title: "Phishing Recognition and Prevention",
            description: "Identify and respond to phishing attacks and social engineering attempts",
            type: "document",
            contentUrl: "/training-materials/phishing-prevention.pdf",
            category: "security",
            createdBy: "system",
            quizId: quiz4
        });

        const training6 = await client.mutation("mutations:createTrainingModule", {
            title: "Data Classification and Handling",
            description: "Understanding data sensitivity levels and proper handling procedures",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/data-classification-training",
            category: "data_protection",
            createdBy: "system",
            quizId: quiz5
        });

        const training7 = await client.mutation("mutations:createTrainingModule", {
            title: "Incident Response Procedures",
            description: "Step-by-step guide to responding to security incidents and breaches",
            type: "document",
            contentUrl: "/training-materials/incident-response.pdf",
            category: "incident_response",
            createdBy: "system",
            quizId: quiz6
        });

        const training8 = await client.mutation("mutations:createTrainingModule", {
            title: "GDPR Compliance for Debt Collection",
            description: "Understanding GDPR requirements in the context of debt collection activities",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/gdpr-debt-collection",
            category: "compliance",
            createdBy: "system"
        });

        const training9 = await client.mutation("mutations:createTrainingModule", {
            title: "Customer Data Privacy Rights",
            description: "Understanding and respecting customer privacy rights and data subject requests",
            type: "document",
            contentUrl: "/training-materials/customer-privacy-rights.pdf",
            category: "privacy",
            createdBy: "system"
        });

        const training10 = await client.mutation("mutations:createTrainingModule", {
            title: "Secure Communication Protocols",
            description: "Best practices for secure email, messaging, and file sharing",
            type: "video",
            contentUrl: "https://www.youtube.com/embed/secure-communication",
            category: "security",
            createdBy: "system"
        });

        // Create additional policies
        console.log("Creating additional policies...");
        const policy3 = await client.mutation("mutations:createPolicy", {
            title: "GDPR Data Subject Rights Policy",
            content: `# GDPR Data Subject Rights Policy

## Overview
This policy outlines how Royal Credit Recoveries handles data subject requests under GDPR.

## Key Rights
- Right to access personal data
- Right to rectification of inaccurate data
- Right to erasure (right to be forgotten)
- Right to restrict processing
- Right to data portability
- Right to object to processing

## Response Timeframes
- Acknowledge requests within 72 hours
- Complete responses within 30 days
- Extensions may be granted for complex requests`,
            category: "gdpr_compliance",
            createdBy: "system",
        });

        const policy4 = await client.mutation("mutations:createPolicy", {
            title: "Incident Response Policy",
            content: `# Incident Response Policy

## Incident Classification
### Critical (P1)
- Data breach affecting customer information
- System compromise with potential data exposure
- Ransomware or malware infection

### High (P2)
- Unauthorized access attempts
- Suspicious network activity
- Phishing attacks targeting employees

### Medium (P3)
- Security control failures
- Policy violations
- Unusual system behavior

## Response Procedures
1. Immediate containment
2. Assessment and investigation
3. Notification procedures
4. Recovery and restoration
5. Lessons learned review`,
            category: "incident_response",
            createdBy: "system",
        });

        const policy5 = await client.mutation("mutations:createPolicy", {
            title: "Employee Security Training Policy",
            content: `# Employee Security Training Policy

## Training Requirements
All employees must complete:
- Security awareness training (annual)
- Role-specific security training
- Incident response training
- Compliance training relevant to their role

## Training Schedule
- New employee orientation: Within first week
- Annual refresher training: Before anniversary date
- Ad-hoc training: As needed for new threats

## Compliance Tracking
- Training completion tracked in HR systems
- Regular audits of training compliance
- Remedial training for non-compliance`,
            category: "training",
            createdBy: "system",
        });

        const policy6 = await client.mutation("mutations:createPolicy", {
            title: "Customer Communication Security Policy",
            content: `# Customer Communication Security Policy

## Secure Communication Channels
- Encrypted email for sensitive information
- Secure customer portal for document exchange
- Verified phone calls with proper authentication

## Information Sharing Guidelines
- Verify customer identity before sharing any information
- Use minimum necessary principle
- Document all communications
- Follow retention schedules

## Prohibited Practices
- Never send sensitive data via unencrypted email
- Never discuss customer information in public areas
- Never leave customer information visible on screens`,
            category: "customer_security",
            createdBy: "system",
        });

        console.log("Sample data created successfully!");
        console.log(`Created policies, quizzes, and training modules`);

    } catch (error) {
        console.error("Error populating sample data:", error);
    }
}

populateSampleData();