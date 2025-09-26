import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new simulation scenario (Admin only)
export const createSimulationScenario = mutation({
  args: {
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
    scenario: v.string(),
    estimatedTime: v.number(),
    category: v.string(),
    learningObjectives: v.array(v.string()),
    tags: v.array(v.string()),
    targetAudience: v.array(v.string()),
    options: v.array(v.object({
      id: v.string(),
      text: v.string(),
      correct: v.boolean(),
      explanation: v.string(),
      consequenceDescription: v.optional(v.string())
    })),
    redFlags: v.array(v.string()),
    tips: v.array(v.string()),
    complianceFramework: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const now = Date.now();

    return await ctx.db.insert("simulationScenarios", {
      ...args,
      isActive: true,
      createdBy: identity.subject,
      createdAt: now,
      updatedAt: now,
      version: "1.0",
      totalAttempts: 0,
      successRate: 0,
      averageTimeSpent: 0,
    });
  }
});

// Get all simulation scenarios
export const getSimulationScenarios = query({
  args: {
    type: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    category: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("simulationScenarios");

    let scenarios;
    if (args.isActive !== undefined) {
      scenarios = await ctx.db
        .query("simulationScenarios")
        .withIndex("by_active", (q) => q.eq("isActive", args.isActive!))
        .collect();
    } else {
      scenarios = await ctx.db.query("simulationScenarios").collect();
    }

    // Apply additional filters
    if (args.type) {
      scenarios = scenarios.filter(s => s.type === args.type);
    }
    if (args.difficulty) {
      scenarios = scenarios.filter(s => s.difficulty === args.difficulty);
    }
    if (args.category) {
      scenarios = scenarios.filter(s => s.category === args.category);
    }

    return scenarios.map(scenario => ({
      ...scenario,
      // Don't expose correct answers in the list view
      options: scenario.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        // correct and explanation fields hidden until submission
      }))
    }));
  }
});

// Get a single simulation scenario with full details (for taking the simulation)
export const getSimulationScenario = query({
  args: { scenarioId: v.id("simulationScenarios") },
  handler: async (ctx, args) => {
    const scenario = await ctx.db.get(args.scenarioId);
    if (!scenario || !scenario.isActive) {
      return null;
    }

    // Return scenario without revealing correct answers
    return {
      ...scenario,
      options: scenario.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        // correct and explanation fields hidden until submission
      }))
    };
  }
});

// Start a new simulation session
export const startSimulationSession = mutation({
  args: {
    sessionType: v.string(),
    difficulty: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    scenarioIds: v.optional(v.array(v.string())), // Specific scenarios to include
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get scenarios based on filters
    let scenarios = await ctx.db.query("simulationScenarios")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    if (args.difficulty) {
      scenarios = scenarios.filter(s => s.difficulty === args.difficulty);
    }
    if (args.categories && args.categories.length > 0) {
      scenarios = scenarios.filter(s => args.categories!.includes(s.category));
    }
    if (args.scenarioIds && args.scenarioIds.length > 0) {
      scenarios = scenarios.filter(s => args.scenarioIds!.includes(s._id));
    }

    const now = Date.now();

    return await ctx.db.insert("simulationSessions", {
      userId: identity.subject,
      sessionType: args.sessionType,
      startedAt: now,
      totalScenarios: scenarios.length,
      completedScenarios: 0,
      correctAnswers: 0,
      totalTimeSpent: 0,
      overallScore: 0,
      difficulty: args.difficulty,
      categories: args.categories,
      isCompleted: false,
    });
  }
});

// Record simulation attempt (enhanced)
export const recordSimulationAttempt = mutation({
  args: {
    scenarioId: v.string(),
    selectedOption: v.string(),
    isCorrect: v.boolean(),
    timeSpent: v.number(), // in seconds
    difficulty: v.string(),
    sessionId: v.optional(v.id("simulationSessions")),
    confidence: v.optional(v.number()),
    hintsUsed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    // Record the attempt in simulationAttempts (for compatibility)
    await ctx.db.insert("simulationAttempts", {
      userId: identity.subject,
      scenarioId: args.scenarioId,
      selectedOption: args.selectedOption,
      isCorrect: args.isCorrect,
      timeSpent: args.timeSpent,
      difficulty: args.difficulty,
      attemptedAt: now
    });

    // If part of a session, also record in simulationProgress
    if (args.sessionId) {
      // Get the scenario details for feedback
      let scenario = null;
      try {
        // Try to get from database first
        scenario = await ctx.db.query("simulationScenarios")
          .filter(q => q.eq(q.field("_id"), args.scenarioId))
          .first();
      } catch (e) {
        // Scenario might be hardcoded, not in DB
      }

      const feedback = scenario ? {
        correctAnswer: scenario.options.find(opt => opt.correct)?.text || "",
        explanation: scenario.options.find(opt => opt.id === args.selectedOption)?.explanation || "",
        redFlagsIdentified: [], // Would need to track which red flags user identified
        missedRedFlags: [], // Would need to track which red flags user missed
        tips: scenario.tips || []
      } : undefined;

      // Count existing attempts for this scenario by this user in this session
      const existingAttempts = await ctx.db.query("simulationProgress")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId!))
        .filter(q => q.and(
          q.eq(q.field("userId"), identity.subject),
          q.eq(q.field("scenarioId"), args.scenarioId)
        ))
        .collect();

      await ctx.db.insert("simulationProgress", {
        userId: identity.subject,
        sessionId: args.sessionId,
        scenarioId: args.scenarioId,
        attemptNumber: existingAttempts.length + 1,
        selectedOptionId: args.selectedOption,
        isCorrect: args.isCorrect,
        timeSpent: args.timeSpent,
        hintsUsed: args.hintsUsed || 0,
        confidence: args.confidence,
        feedback,
        completedAt: now,
      });

      // Update session progress
      const session = await ctx.db.get(args.sessionId);
      if (session) {
        const newCompletedScenarios = session.completedScenarios + 1;
        const newCorrectAnswers = session.correctAnswers + (args.isCorrect ? 1 : 0);
        const newTotalTimeSpent = session.totalTimeSpent + args.timeSpent;
        const newOverallScore = Math.round((newCorrectAnswers / newCompletedScenarios) * 100);

        await ctx.db.patch(args.sessionId, {
          completedScenarios: newCompletedScenarios,
          correctAnswers: newCorrectAnswers,
          totalTimeSpent: newTotalTimeSpent,
          overallScore: newOverallScore,
          isCompleted: newCompletedScenarios >= session.totalScenarios,
          ...(newCompletedScenarios >= session.totalScenarios && { completedAt: now })
        });
      }
    }

    // Update scenario statistics if it's a database scenario
    try {
      const dbScenario = await ctx.db.query("simulationScenarios")
        .filter(q => q.eq(q.field("_id"), args.scenarioId))
        .first();
      
      if (dbScenario) {
        const newTotalAttempts = dbScenario.totalAttempts + 1;
        const newCorrectAttempts = args.isCorrect ? 
          Math.round(dbScenario.successRate * dbScenario.totalAttempts / 100) + 1 :
          Math.round(dbScenario.successRate * dbScenario.totalAttempts / 100);
        const newSuccessRate = (newCorrectAttempts / newTotalAttempts) * 100;
        const newAverageTime = ((dbScenario.averageTimeSpent * dbScenario.totalAttempts) + args.timeSpent) / newTotalAttempts;

        await ctx.db.patch(dbScenario._id, {
          totalAttempts: newTotalAttempts,
          successRate: Math.round(newSuccessRate * 100) / 100,
          averageTimeSpent: Math.round(newAverageTime),
        });
      }
    } catch (e) {
      // Scenario not in database, skip statistics update
    }

    return { success: true, attemptId: now };
  }
});

// Complete simulation session
export const completeSimulationSession = mutation({
  args: { sessionId: v.id("simulationSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== identity.subject) {
      throw new Error("Session not found or unauthorized");
    }

    if (session.isCompleted) {
      return session; // Already completed
    }

    const now = Date.now();

    // Calculate final session results
    const sessionProgress = await ctx.db.query("simulationProgress")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Analyze performance to provide recommendations
    const categoryPerformance = new Map();
    const difficultyPerformance = new Map();

    for (const progress of sessionProgress) {
      // This would need scenario details to categorize properly
      // For now, we'll use basic analysis
      if (progress.isCorrect) {
        // User performed well in this area
      } else {
        // Area for improvement
      }
    }

    // Determine strengths and areas for improvement
    const strengths: string[] = [];
    const improvementAreas: string[] = [];
    const recommendedTraining: string[] = [];

    if (session.overallScore >= 90) {
      strengths.push("Excellent security awareness");
    } else if (session.overallScore >= 70) {
      strengths.push("Good security knowledge");
    } else {
      improvementAreas.push("General security awareness needs improvement");
    }

    // Check certification eligibility (80% or higher)
    const certificationEligible = session.overallScore >= 80;

    // Update session with completion data
    await ctx.db.patch(args.sessionId, {
      isCompleted: true,
      completedAt: now,
      strengths,
      improvementAreas,
      recommendedTraining,
      certificationEligible,
    });

    // Award achievements if applicable
    await checkAndAwardAchievements(ctx, identity.subject, session, sessionProgress);

    return await ctx.db.get(args.sessionId);
  }
});

// Helper function to check and award achievements
async function checkAndAwardAchievements(ctx: any, userId: string, session: any, sessionProgress: any[]) {
  const now = Date.now();

  // First simulation completion
  const existingSessions = await ctx.db.query("simulationSessions")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.eq(q.field("isCompleted"), true))
    .collect();

  if (existingSessions.length === 1) { // This is the first completed session
    await ctx.db.insert("simulationAchievements", {
      userId,
      achievementType: "first_completion",
      achievementName: "First Steps",
      description: "Completed your first security simulation session",
      badgeIcon: "trophy",
      badgeColor: "bronze",
      criteria: {
        requirement: "Complete first simulation session",
      },
      earnedAt: now,
      sessionId: session._id,
      points: 50,
    });
  }

  // Perfect score achievement
  if (session.overallScore === 100) {
    await ctx.db.insert("simulationAchievements", {
      userId,
      achievementType: "perfect_score",
      achievementName: "Perfect Score",
      description: "Achieved 100% accuracy in a simulation session",
      badgeIcon: "star",
      badgeColor: "gold",
      criteria: {
        requirement: "Score 100% in a simulation session",
        threshold: 100,
      },
      earnedAt: now,
      sessionId: session._id,
      points: 200,
    });
  }

  // Speed demon (completed quickly)
  const averageTimePerScenario = session.totalTimeSpent / session.completedScenarios;
  if (averageTimePerScenario < 60 && session.overallScore >= 80) { // Less than 1 minute per scenario with good accuracy
    await ctx.db.insert("simulationAchievements", {
      userId,
      achievementType: "speed_demon",
      achievementName: "Speed Demon",
      description: "Completed simulation quickly while maintaining high accuracy",
      badgeIcon: "zap",
      badgeColor: "silver",
      criteria: {
        requirement: "Complete scenarios in under 60 seconds each with 80%+ accuracy",
        threshold: 60,
      },
      earnedAt: now,
      sessionId: session._id,
      points: 100,
    });
  }

  // Expert level (high score on advanced scenarios)
  if (session.difficulty === "advanced" && session.overallScore >= 90) {
    await ctx.db.insert("simulationAchievements", {
      userId,
      achievementType: "expert_level",
      achievementName: "Security Expert",
      description: "Achieved excellent performance on advanced simulations",
      badgeIcon: "shield",
      badgeColor: "platinum",
      criteria: {
        requirement: "Score 90%+ on advanced difficulty simulations",
        threshold: 90,
        category: "advanced",
      },
      earnedAt: now,
      sessionId: session._id,
      points: 300,
    });
  }
}

// Get user's simulation sessions
export const getUserSimulationSessions = query({
  args: {
    completed: v.optional(v.boolean()),
    sessionType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    let query = ctx.db.query("simulationSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject));

    let sessions = await query.collect();

    if (args.completed !== undefined) {
      sessions = sessions.filter(s => s.isCompleted === args.completed);
    }
    if (args.sessionType) {
      sessions = sessions.filter(s => s.sessionType === args.sessionType);
    }

    return sessions.sort((a, b) => b.startedAt - a.startedAt);
  }
});

// Get user's simulation progress
export const getUserSimulationProgress = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return await ctx.db
      .query("simulationAttempts")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  }
});

// Get detailed session progress
export const getSessionProgress = query({
  args: { sessionId: v.id("simulationSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== identity.subject) {
      throw new Error("Session not found or unauthorized");
    }

    const progress = await ctx.db.query("simulationProgress")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    return {
      session,
      progress: progress.sort((a, b) => a.completedAt - b.completedAt)
    };
  }
});

// Get user achievements
export const getUserAchievements = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return await ctx.db.query("simulationAchievements")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  }
});

// Get simulation statistics (enhanced)
export const getSimulationStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        totalAttempts: 0,
        correctAnswers: 0,
        averageTime: 0,
        completedScenarios: [],
        accuracyRate: 0,
        totalSessions: 0,
        completedSessions: 0,
        totalPoints: 0,
        achievements: 0,
        currentStreak: 0,
        bestScore: 0,
        categoryStats: []
      };
    }

    // Get basic attempt data
    const attempts = await ctx.db
      .query("simulationAttempts")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Get session data
    const sessions = await ctx.db
      .query("simulationSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Get achievements
    const achievements = await ctx.db
      .query("simulationAchievements")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const totalAttempts = attempts.length;
    const correctAnswers = attempts.filter(a => a.isCorrect).length;
    const averageTime = attempts.length > 0 
      ? attempts.reduce((sum, a) => sum + a.timeSpent, 0) / attempts.length 
      : 0;
    const completedScenarios = [...new Set(attempts.map(a => a.scenarioId))];
    const accuracyRate = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.isCompleted).length;
    const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
    const bestScore = Math.max(0, ...sessions.map(s => s.overallScore));

    // Calculate current streak (consecutive correct answers in recent attempts)
    let currentStreak = 0;
    const recentAttempts = attempts.sort((a, b) => b.attemptedAt - a.attemptedAt);
    for (const attempt of recentAttempts) {
      if (attempt.isCorrect) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Category performance analysis
    const categoryStats: { [key: string]: { attempts: number; correct: number; averageTime: number } } = {};
    for (const attempt of attempts) {
      if (!categoryStats[attempt.difficulty]) {
        categoryStats[attempt.difficulty] = { attempts: 0, correct: 0, averageTime: 0 };
      }
      categoryStats[attempt.difficulty].attempts++;
      if (attempt.isCorrect) categoryStats[attempt.difficulty].correct++;
      categoryStats[attempt.difficulty].averageTime += attempt.timeSpent;
    }

    const categoryStatsArray = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      attempts: stats.attempts,
      correct: stats.correct,
      accuracyRate: stats.attempts > 0 ? (stats.correct / stats.attempts) * 100 : 0,
      averageTime: stats.attempts > 0 ? Math.round(stats.averageTime / stats.attempts) : 0
    }));

    return {
      totalAttempts,
      correctAnswers,
      averageTime: Math.round(averageTime),
      completedScenarios,
      accuracyRate: Math.round(accuracyRate * 100) / 100,
      totalSessions,
      completedSessions,
      totalPoints,
      achievements: achievements.length,
      currentStreak,
      bestScore,
      categoryStats: categoryStatsArray
    };
  }
});

// Get simulation dashboard data
export const getSimulationDashboard = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        recentSessions: [],
        achievements: [],
        stats: {
          totalAttempts: 0,
          correctAnswers: 0,
          averageTime: 0,
          completedScenarios: [],
          accuracyRate: 0,
          totalSessions: 0,
          completedSessions: 0,
          totalPoints: 0,
          achievements: 0,
          currentStreak: 0,
          bestScore: 0,
          categoryStats: []
        },
        leaderboard: []
      };
    }

    // Get recent sessions
    const recentSessions = await ctx.db
      .query("simulationSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(5);

    // Get recent achievements
    const recentAchievements = await ctx.db
      .query("simulationAchievements")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(3);

    // Calculate user stats inline (simplified for dashboard)
    const attempts = await ctx.db
      .query("simulationAttempts")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const sessions = await ctx.db
      .query("simulationSessions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const achievements = await ctx.db
      .query("simulationAchievements")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const stats = {
      totalAttempts: attempts.length,
      correctAnswers: attempts.filter(a => a.isCorrect).length,
      averageTime: attempts.length > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.timeSpent, 0) / attempts.length) : 0,
      completedScenarios: [...new Set(attempts.map(a => a.scenarioId))],
      accuracyRate: attempts.length > 0 ? Math.round((attempts.filter(a => a.isCorrect).length / attempts.length) * 100 * 100) / 100 : 0,
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.isCompleted).length,
      totalPoints: achievements.reduce((sum, a) => sum + a.points, 0),
      achievements: achievements.length,
      currentStreak: 0, // Simplified for dashboard
      bestScore: Math.max(0, ...sessions.map(s => s.overallScore)),
      categoryStats: []
    };

    return {
      recentSessions,
      achievements: recentAchievements,
      stats,
      leaderboard: [] // Simplified for dashboard
    };
  }
});

// Get leaderboard for simulations
export const getSimulationLeaderboard = query({
  handler: async (ctx) => {
    // Get all users' simulation attempts
    const attempts = await ctx.db.query("simulationAttempts").collect();
    
    // Group by user and calculate stats
    const userStats = new Map();
    
    for (const attempt of attempts) {
      if (!userStats.has(attempt.userId)) {
        userStats.set(attempt.userId, {
          userId: attempt.userId,
          totalAttempts: 0,
          correctAnswers: 0,
          totalTime: 0,
          scenarios: new Set()
        });
      }
      
      const stats = userStats.get(attempt.userId);
      stats.totalAttempts++;
      if (attempt.isCorrect) stats.correctAnswers++;
      stats.totalTime += attempt.timeSpent;
      stats.scenarios.add(attempt.scenarioId);
    }
    
    // Convert to array and calculate final scores
    const leaderboard = Array.from(userStats.values()).map(stats => ({
      userId: stats.userId,
      totalAttempts: stats.totalAttempts,
      correctAnswers: stats.correctAnswers,
      accuracyRate: stats.totalAttempts > 0 ? (stats.correctAnswers / stats.totalAttempts) * 100 : 0,
      averageTime: stats.totalAttempts > 0 ? stats.totalTime / stats.totalAttempts : 0,
      uniqueScenarios: stats.scenarios.size,
      score: (stats.correctAnswers * 10) + (stats.scenarios.size * 5) // Simple scoring system
    }));
    
    // Sort by score descending
    return leaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
  }
});

// Admin function: Create sample simulation scenarios
export const createSampleSimulationScenarios = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const now = Date.now();
    const sampleScenarios = [];

    // Phishing Email Scenario
    const phishingScenario = await ctx.db.insert("simulationScenarios", {
      title: "Suspicious Banking Email",
      type: "phishing_email" as const,
      difficulty: "beginner" as const,
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
      estimatedTime: 5,
      category: "email_security",
      isActive: true,
      createdBy: identity.subject,
      createdAt: now,
      updatedAt: now,
      version: "1.0",
      learningObjectives: [
        "Identify phishing email characteristics",
        "Recognize urgent language tactics",
        "Verify sender authenticity"
      ],
      tags: ["phishing", "email", "security", "verification"],
      targetAudience: ["all_employees", "customer_service"],
      complianceFramework: ["PCI_DSS", "Data_Protection_Act"],
      options: [
        {
          id: "forward-customer",
          text: "Forward the email to the customer asking them to verify their information",
          correct: false,
          explanation: "Never forward suspicious emails. This could put the customer at risk.",
          consequenceDescription: "The customer might fall victim to the phishing attack."
        },
        {
          id: "click-verify",
          text: "Click the link to see if it's legitimate before advising the customer",
          correct: false,
          explanation: "Never click suspicious links, even to test them. This could compromise your system.",
          consequenceDescription: "Your computer could be infected with malware."
        },
        {
          id: "report-phishing",
          text: "Report this as a phishing attempt and advise the customer not to click any links",
          correct: true,
          explanation: "Correct! This email has multiple red flags indicating it's a phishing attempt.",
          consequenceDescription: "The customer is protected from the phishing attack."
        },
        {
          id: "ignore-email",
          text: "Ignore the email since it's not addressed to you",
          correct: false,
          explanation: "You should always report suspicious emails to protect customers and the company.",
          consequenceDescription: "Other customers might fall victim to similar attacks."
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
      ],
      totalAttempts: 0,
      successRate: 0,
      averageTimeSpent: 0,
    });

    sampleScenarios.push(phishingScenario);

    // Social Engineering Call Scenario
    const socialEngineeringScenario = await ctx.db.insert("simulationScenarios", {
      title: "Impersonation Phone Call",
      type: "social_engineering_call" as const,
      difficulty: "intermediate" as const,
      description: "You receive a call from someone claiming to be from IT support. What do you do?",
      scenario: `CALLER: "Hello, this is Mike from IT Support. We're experiencing some network issues and I need to verify your login credentials to ensure your account hasn't been compromised. Can you please provide me with your username and current password so I can check your account status?"

YOU: "I wasn't aware of any network issues..."

CALLER: "Yes, it's affecting several departments. We're trying to resolve it quickly to minimize downtime. This is urgent - if I can't verify your credentials now, we may need to disable your account as a security precaution until tomorrow. I just need your username and password to run a quick security check."`,
      estimatedTime: 7,
      category: "phone_security",
      isActive: true,
      createdBy: identity.subject,
      createdAt: now,
      updatedAt: now,
      version: "1.0",
      learningObjectives: [
        "Recognize social engineering tactics",
        "Verify caller identity properly",
        "Understand IT security protocols"
      ],
      tags: ["social_engineering", "phone", "credentials", "verification"],
      targetAudience: ["all_employees"],
      complianceFramework: ["PCI_DSS"],
      options: [
        {
          id: "provide-credentials",
          text: "Provide your username and password since it's IT support",
          correct: false,
          explanation: "Never provide credentials over the phone, even to claimed IT staff.",
          consequenceDescription: "Your account could be compromised and used for malicious purposes."
        },
        {
          id: "hang-up-verify",
          text: "Politely decline, hang up, and call IT directly to verify",
          correct: true,
          explanation: "Correct! Always verify the caller's identity through official channels.",
          consequenceDescription: "You prevent a potential security breach."
        },
        {
          id: "provide-username-only",
          text: "Give only your username but refuse to share your password",
          correct: false,
          explanation: "Don't provide any credentials over the phone, even usernames can be valuable to attackers.",
          consequenceDescription: "Attackers can use your username for targeted attacks."
        },
        {
          id: "ask-for-id",
          text: "Ask for their employee ID and department before sharing information",
          correct: false,
          explanation: "Attackers can easily fake employee IDs. Always verify through official channels.",
          consequenceDescription: "The attacker might provide fake credentials and continue the deception."
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
      ],
      totalAttempts: 0,
      successRate: 0,
      averageTimeSpent: 0,
    });

    sampleScenarios.push(socialEngineeringScenario);

    // Data Handling Scenario
    const dataHandlingScenario = await ctx.db.insert("simulationScenarios", {
      title: "Customer Data Request",
      type: "data_handling" as const,
      difficulty: "advanced" as const,
      description: "A caller claims to be a customer's lawyer requesting sensitive information. How do you handle this?",
      scenario: `CALLER: "Good afternoon, I'm Sarah Johnson, legal counsel for Mr. David Smith, one of your customers. I'm calling regarding a legal matter and need to obtain his complete account history, payment records, and call recordings from the past two years. This is for ongoing litigation and I need this information by end of business today. Mr. Smith has authorized me to collect this information on his behalf."

The caller provides what appears to be correct account details and knows some information about recent transactions.`,
      estimatedTime: 8,
      category: "data_protection",
      isActive: true,
      createdBy: identity.subject,
      createdAt: now,
      updatedAt: now,
      version: "1.0",
      learningObjectives: [
        "Understand legal data disclosure procedures",
        "Verify authorization properly",
        "Protect customer privacy rights"
      ],
      tags: ["data_protection", "legal", "privacy", "authorization"],
      targetAudience: ["customer_service", "management"],
      complianceFramework: ["Data_Protection_Act", "PCI_DSS"],
      options: [
        {
          id: "provide-information",
          text: "Provide the information since they have account details and claim authorization",
          correct: false,
          explanation: "Never provide sensitive information without proper authorization and verification procedures.",
          consequenceDescription: "Customer privacy is violated and company faces legal liability."
        },
        {
          id: "request-written-authorization",
          text: "Request written authorization from the customer and follow proper legal disclosure procedures",
          correct: true,
          explanation: "Correct! Always follow formal procedures for legal requests and verify authorization.",
          consequenceDescription: "Customer privacy is protected and legal requirements are met."
        },
        {
          id: "transfer-supervisor",
          text: "Transfer the call to your supervisor without providing any information",
          correct: false,
          explanation: "While escalation is good, you should first inform them of the proper procedures.",
          consequenceDescription: "The issue is escalated but proper procedures might not be followed."
        },
        {
          id: "schedule-callback",
          text: "Schedule a callback after verifying the lawyer's credentials online",
          correct: false,
          explanation: "Even with verification, you must follow formal legal disclosure procedures.",
          consequenceDescription: "Verification is good but formal authorization is still required."
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
      ],
      totalAttempts: 0,
      successRate: 0,
      averageTimeSpent: 0,
    });

    sampleScenarios.push(dataHandlingScenario);

    return {
      success: true,
      scenariosCreated: sampleScenarios.length,
      scenarios: sampleScenarios
    };
  }
});

// Update simulation scenario (Admin only)
export const updateSimulationScenario = mutation({
  args: {
    scenarioId: v.id("simulationScenarios"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    scenario: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    options: v.optional(v.array(v.object({
      id: v.string(),
      text: v.string(),
      correct: v.boolean(),
      explanation: v.string(),
      consequenceDescription: v.optional(v.string())
    }))),
    redFlags: v.optional(v.array(v.string())),
    tips: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const { scenarioId, ...updateData } = args;

    await ctx.db.patch(scenarioId, {
      ...updateData,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(scenarioId);
  }
});

// Delete simulation scenario (Admin only)
export const deleteSimulationScenario = mutation({
  args: { scenarioId: v.id("simulationScenarios") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.delete(args.scenarioId);
    return { success: true };
  }
});