import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (synced from Clerk)
  users: defineTable({
    clerkId: v.string(), // Clerk user ID
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    role: v.string(), // "admin", "employee"
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),
  // User roles and permissions (synced from Clerk)
  userRoles: defineTable({
    userId: v.string(), // Clerk user ID
    role: v.string(), // admin, teacher, student
    assignedBy: v.string(), // User ID who assigned the role
    assignedAt: v.number(),
    isActive: v.boolean(),
    metadata: v.optional(v.object({
      department: v.optional(v.string()),
      permissions: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
    })),
  }).index("by_user", ["userId"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"]),

  // Role permissions audit log
  roleAuditLog: defineTable({
    targetUserId: v.string(),
    performedBy: v.string(),
    action: v.string(), // "role_assigned", "role_removed", "permission_granted", etc.
    previousRole: v.optional(v.string()),
    newRole: v.optional(v.string()),
    reason: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_target_user", ["targetUserId"])
    .index("by_performer", ["performedBy"])
    .index("by_timestamp", ["timestamp"]),

  // Enhanced policies table for Royal Credit Recoveries
  policies: defineTable({
    title: v.string(),
    content: v.string(), // Markdown content
    summary: v.string(), // Brief summary for overview
    category: v.string(), // e.g., "data_protection", "pci_compliance", "general_security"
    version: v.string(), // Version number (e.g., "1.0", "1.1")
    effectiveDate: v.number(), // When this version becomes effective
    expiryDate: v.optional(v.number()), // When this version expires
    status: v.string(), // "draft", "active", "archived", "superseded"
    createdBy: v.string(), // Admin who created the policy
    approvedBy: v.optional(v.string()), // Admin who approved the policy
    approvedAt: v.optional(v.number()),
    requiresAcknowledgment: v.boolean(),
    acknowledgmentDeadline: v.optional(v.number()),
    issuedNotifications: v.boolean(), // Whether notifications have been sent
    tags: v.array(v.string()),
    attachments: v.optional(v.array(v.object({
      fileName: v.string(),
      fileUrl: v.string(),
      fileSize: v.number(),
      uploadedAt: v.number()
    }))),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_version", ["title", "version"])
    .index("by_effective_date", ["effectiveDate"]),

  // Policy acknowledgments tracking
  policyAcknowledgments: defineTable({
    policyId: v.id("policies"),
    userId: v.string(), // Clerk user ID
    acknowledgedAt: v.number(),
    acknowledgedVersion: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    method: v.string(), // "digital_signature", "checkbox", "biometric"
    notes: v.optional(v.string()),
  }).index("by_policy", ["policyId"])
    .index("by_user", ["userId"])
    .index("by_user_and_policy", ["userId", "policyId"]),

  // Enhanced training modules for Royal Credit Recoveries
  trainingModules: defineTable({
    title: v.string(),
    description: v.string(),
    summary: v.optional(v.string()), // Brief overview
    type: v.union(
      v.literal("video"), 
      v.literal("document"), 
      v.literal("interactive"), 
      v.literal("simulation"),
      v.literal("assessment")
    ),
    category: v.string(), // e.g., "pci_compliance", "data_protection", "call_security"
    difficulty: v.string(), // "beginner", "intermediate", "advanced"
    estimatedDuration: v.number(), // in minutes
    contentUrl: v.string(), // e.g., YouTube embed URL or PDF link
    content: v.optional(v.string()), // Embedded content for interactive modules
    prerequisites: v.optional(v.array(v.id("trainingModules"))),
    learningObjectives: v.array(v.string()),
    isRequired: v.boolean(),
    targetAudience: v.array(v.string()), // e.g., ["call_center", "management", "all_employees"]
    complianceFramework: v.optional(v.array(v.string())), // e.g., ["PCI_DSS", "Data_Protection_Act"]
    tags: v.array(v.string()),
    quizId: v.optional(v.id("quizzes")),
    passScore: v.optional(v.number()), // Required passing score for associated quiz
    certificateTemplate: v.optional(v.string()),
    version: v.string(),
    status: v.string(), // "draft", "active", "archived"
    createdBy: v.string(),
    approvedBy: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_required", ["isRequired"])
    .index("by_target_audience", ["targetAudience"]),

  // Quizzes
  quizzes: defineTable({
    title: v.string(),
    questions: v.array(
      v.object({
        questionText: v.string(),
        options: v.array(v.string()),
        correctAnswerIndex: v.number(),
      })
    ),
  }),

  // User progress tracking
  userProgress: defineTable({
    userId: v.id("users"),
    moduleId: v.id("trainingModules"),
    quizScore: v.optional(v.number()),
    completedAt: v.number(),
    lastAccessedAt: v.optional(v.number()),
    timeSpent: v.optional(v.number()),
    completionMethod: v.optional(v.string()),
  }).index("by_user_and_module", ["userId", "moduleId"]),

  // Quiz results/attempts tracking
  quizResults: defineTable({
    userId: v.string(), // Clerk user ID
    quizId: v.id("quizzes"),
    answers: v.array(v.number()), // Array of selected answer indices
    score: v.number(), // Number of correct answers
    totalQuestions: v.number(),
    percentage: v.number(),
    completedAt: v.number(),
    timeSpent: v.optional(v.number()), // Time in seconds
  }).index("by_user", ["userId"])
    .index("by_quiz", ["quizId"])
    .index("by_user_and_quiz", ["userId", "quizId"])
    .index("by_completed_at", ["completedAt"]),

  // Enhanced user certifications for Royal Credit Recoveries
  certifications: defineTable({
    userId: v.string(), // Clerk user ID
    title: v.string(), // e.g., "PCI DSS Compliance Certificate"
    description: v.string(),
    category: v.string(), // e.g., "data_protection", "pci_compliance"
    certificateType: v.string(), // "completion", "competency", "compliance"
    requirements: v.array(v.object({
      type: v.string(), // "module", "quiz", "score"
      id: v.string(),
      minimumScore: v.optional(v.number()),
      completed: v.boolean()
    })),
    requiredModules: v.array(v.id("trainingModules")),
    requiredQuizzes: v.array(v.id("quizzes")),
    minimumOverallScore: v.optional(v.number()),
    completedRequirements: v.array(v.string()),
    issuedAt: v.number(),
    expiresAt: v.optional(v.number()),
    renewalNotificationSent: v.optional(v.boolean()),
    status: v.string(), // "earned", "active", "expired", "revoked", "pending"
    certificateId: v.string(), // unique certificate identifier
    digitalSignature: v.optional(v.string()),
    verificationCode: v.string(), // for certificate verification
    issuedBy: v.string(), // Admin who issued the certificate
    complianceFramework: v.optional(v.array(v.string())), // e.g., ["PCI_DSS", "Data_Protection_Act"]
    creditsEarned: v.optional(v.number()), // CPE credits or similar
    metadata: v.optional(v.object({
      finalScore: v.optional(v.number()),
      timeToComplete: v.optional(v.number()),
      attemptCount: v.optional(v.number()),
      specialNotes: v.optional(v.string())
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_expiry", ["expiresAt"])
    .index("by_verification_code", ["verificationCode"]),

  // Certification templates for different training paths
  certificationTemplates: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    certificateType: v.string(),
    requiredModules: v.array(v.id("trainingModules")),
    requiredQuizzes: v.array(v.id("quizzes")),
    minimumOverallScore: v.optional(v.number()),
    validityPeriod: v.optional(v.number()), // in days
    complianceFramework: v.optional(v.array(v.string())),
    creditsAwarded: v.optional(v.number()),
    isActive: v.boolean(),
    autoAward: v.boolean(), // automatically award when requirements met
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  // FAQs
  faqs: defineTable({
    question: v.string(),
    answer: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    isActive: v.boolean(),
    order: v.number(),
    helpful: v.number(),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["category"])
    .index("by_active", ["isActive"])
    .index("by_order", ["order"]),

  // FAQ feedback tracking
  faqFeedback: defineTable({
    faqId: v.id("faqs"),
    userId: v.string(), // Clerk user ID
    helpful: v.boolean(),
    createdAt: v.number(),
  }).index("by_faq", ["faqId"])
    .index("by_user", ["userId"])
    .index("by_user_and_faq", ["userId", "faqId"]),

  // Compliance reports
  complianceReports: defineTable({
    title: v.string(),
    reportType: v.string(), // "weekly", "monthly", "quarterly", "annual"
    generatedBy: v.string(),
    generatedAt: v.number(),
    data: v.object({
      totalUsers: v.number(),
      completedUsers: v.number(),
      inProgressUsers: v.number(),
      notStartedUsers: v.number(),
      averageScore: v.number(),
      moduleCompletion: v.array(v.object({
        moduleId: v.string(),
        moduleName: v.string(),
        completionRate: v.number(),
        averageScore: v.number(),
      })),
      quizResults: v.array(v.object({
        quizId: v.string(),
        quizName: v.string(),
        completionRate: v.number(),
        averageScore: v.number(),
        passRate: v.number(),
      })),
    }),
  }).index("by_type", ["reportType"])
    .index("by_date", ["generatedAt"]),

  // Activity logs for audit trail
  activityLogs: defineTable({
    userId: v.string(),
    action: v.string(), // "login", "policy_viewed", "quiz_started", "quiz_completed", etc.
    resourceType: v.optional(v.string()), // "policy", "quiz", "training_module"
    resourceId: v.optional(v.string()),
    metadata: v.optional(v.object({
      score: v.optional(v.number()),
      timeSpent: v.optional(v.number()),
      ipAddress: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    })),
    timestamp: v.number(),
  }).index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_timestamp", ["timestamp"]),

  // Report scheduling system
  reportSchedules: defineTable({
    reportType: v.string(), // "compliance", "training", "certifications", "policies"
    frequency: v.string(), // "daily", "weekly", "monthly"
    recipients: v.array(v.string()), // email addresses
    format: v.string(), // "pdf", "csv", "email"
    
    // Scheduling
    createdAt: v.number(),
    createdBy: v.string(),
    active: v.boolean(),
    lastGenerated: v.optional(v.number()),
    nextGeneration: v.number(),
    
    // Configuration
    filters: v.optional(v.object({
      departments: v.optional(v.array(v.string())),
      timeframe: v.optional(v.number()),
      includeDetails: v.optional(v.boolean())
    }))
  }).index("by_user", ["createdBy"])
    .index("by_active", ["active"])
    .index("by_next_generation", ["nextGeneration"]),

  // Simulation attempts tracking
  simulationAttempts: defineTable({
    userId: v.string(), // Clerk user ID
    scenarioId: v.string(), // ID of the simulation scenario
    selectedOption: v.string(), // ID of the selected option
    isCorrect: v.boolean(),
    timeSpent: v.number(), // Time in seconds
    difficulty: v.string(), // "beginner", "intermediate", "advanced"
    attemptedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_scenario", ["scenarioId"])
    .index("by_date", ["attemptedAt"]),

  // Simulation scenarios (stored in database)
  simulationScenarios: defineTable({
    title: v.string(),
    type: v.union(
      v.literal("phishing_email"),
      v.literal("social_engineering_call"),
      v.literal("physical_security"),
      v.literal("data_handling"),
      v.literal("malware_detection"),
      v.literal("password_security"),
      v.literal("mobile_security")
    ),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    description: v.string(),
    scenario: v.string(), // The main scenario text/content
    estimatedTime: v.number(), // Estimated time to complete in minutes
    category: v.string(), // e.g., "email_security", "phone_security", "data_protection"
    isActive: v.boolean(),
    createdBy: v.string(), // Admin who created this scenario
    createdAt: v.number(),
    updatedAt: v.number(),
    version: v.string(), // Version of the scenario
    
    // Learning objectives and metadata
    learningObjectives: v.array(v.string()),
    tags: v.array(v.string()),
    targetAudience: v.array(v.string()),
    complianceFramework: v.optional(v.array(v.string())),
    
    // Options and correct answers
    options: v.array(v.object({
      id: v.string(),
      text: v.string(),
      correct: v.boolean(),
      explanation: v.string(),
      consequenceDescription: v.optional(v.string()) // What happens if this option is chosen
    })),
    
    // Educational content
    redFlags: v.array(v.string()), // Warning signs to look for
    tips: v.array(v.string()), // Best practice tips
    additionalResources: v.optional(v.array(v.object({
      title: v.string(),
      url: v.string(),
      type: v.string() // "article", "video", "policy", "training"
    }))),
    
    // Analytics and tracking
    totalAttempts: v.number(),
    successRate: v.number(), // Percentage of correct attempts
    averageTimeSpent: v.number(), // Average time spent on this scenario
  }).index("by_type", ["type"])
    .index("by_difficulty", ["difficulty"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"])
    .index("by_created_by", ["createdBy"]),

  // Simulation sessions (for tracking complete simulation sessions)
  simulationSessions: defineTable({
    userId: v.string(), // Clerk user ID
    sessionType: v.string(), // "practice", "assessment", "training"
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    totalScenarios: v.number(),
    completedScenarios: v.number(),
    correctAnswers: v.number(),
    totalTimeSpent: v.number(), // Total time in seconds
    overallScore: v.number(), // Calculated score based on performance
    
    // Session configuration
    difficulty: v.optional(v.string()), // If session was filtered by difficulty
    categories: v.optional(v.array(v.string())), // Categories included in session
    isCompleted: v.boolean(),
    
    // Results and feedback
    strengths: v.optional(v.array(v.string())), // Areas where user performed well
    improvementAreas: v.optional(v.array(v.string())), // Areas needing improvement
    recommendedTraining: v.optional(v.array(v.string())), // Suggested training modules
    
    // Certification tracking
    certificationEligible: v.optional(v.boolean()),
    certificateAwarded: v.optional(v.boolean()),
    certificateId: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_session_type", ["sessionType"])
    .index("by_completed", ["isCompleted"])
    .index("by_date", ["startedAt"]),

  // Simulation progress tracking (for individual scenarios within sessions)
  simulationProgress: defineTable({
    userId: v.string(),
    sessionId: v.id("simulationSessions"),
    scenarioId: v.string(), // Can reference simulationScenarios._id or hardcoded scenario IDs
    attemptNumber: v.number(), // If user retries the same scenario
    selectedOptionId: v.string(),
    isCorrect: v.boolean(),
    timeSpent: v.number(), // Time spent on this specific scenario
    hintsUsed: v.number(), // Number of hints accessed
    confidence: v.optional(v.number()), // User's self-reported confidence (1-5)
    
    // Detailed feedback
    feedback: v.optional(v.object({
      correctAnswer: v.string(),
      explanation: v.string(),
      redFlagsIdentified: v.array(v.string()),
      missedRedFlags: v.array(v.string()),
      tips: v.array(v.string())
    })),
    
    completedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_scenario", ["scenarioId"])
    .index("by_user_and_scenario", ["userId", "scenarioId"]),

  // Simulation achievements and badges
  simulationAchievements: defineTable({
    userId: v.string(),
    achievementType: v.string(), // "first_correct", "perfect_session", "speed_demon", "expert_level", etc.
    achievementName: v.string(),
    description: v.string(),
    badgeIcon: v.string(), // Icon identifier or URL
    badgeColor: v.string(),
    criteria: v.object({
      requirement: v.string(), // Description of what was required
      threshold: v.optional(v.number()), // Numeric threshold if applicable
      category: v.optional(v.string()), // Specific category if achievement is category-specific
    }),
    earnedAt: v.number(),
    sessionId: v.optional(v.id("simulationSessions")), // Session where achievement was earned
    points: v.number(), // Points awarded for this achievement
  }).index("by_user", ["userId"])
    .index("by_type", ["achievementType"])
    .index("by_earned_date", ["earnedAt"]),

  // Simulation leaderboards and competitions
  simulationLeaderboards: defineTable({
    leaderboardType: v.string(), // "daily", "weekly", "monthly", "all_time"
    category: v.optional(v.string()), // Specific category leaderboard
    difficulty: v.optional(v.string()), // Specific difficulty leaderboard
    periodStart: v.number(),
    periodEnd: v.number(),
    
    rankings: v.array(v.object({
      userId: v.string(),
      displayName: v.string(),
      totalScore: v.number(),
      correctAnswers: v.number(),
      totalAttempts: v.number(),
      accuracyRate: v.number(),
      averageTime: v.number(),
      achievements: v.number(), // Number of achievements earned
      rank: v.number()
    })),
    
    lastUpdated: v.number(),
    isActive: v.boolean(),
  }).index("by_type", ["leaderboardType"])
    .index("by_category", ["category"])
    .index("by_period", ["periodStart", "periodEnd"]),
});