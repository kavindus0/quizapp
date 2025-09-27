import { v } from "convex/values";
import { query } from "./_generated/server";

// Get detailed user quiz analytics data
export const getUserQuizAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get user's quiz results
    const quizResults = await ctx.db
      .query("quizResults")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .order("desc")
      .collect();

    // Get user progress data
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    const userProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_module", (q) => q.eq("userId", user._id))
      .collect();

    // Get training modules for context
    const modules = await ctx.db
      .query("trainingModules")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Create a map for quick module lookup
    const moduleMap = new Map(modules.map(m => [m._id, m]));

    // Enrich progress data with module titles
    const enrichedProgress = userProgress.map(progress => {
      const module = moduleMap.get(progress.moduleId);
      return {
        moduleId: progress.moduleId,
        moduleTitle: module?.title || "Unknown Module",
        quizScore: progress.quizScore,
        completedAt: progress.completedAt || 0,
        timeSpent: progress.timeSpent,
        isCompleted: (progress.completedAt || 0) > 0,
        lastAccessedAt: progress.lastAccessedAt,
      };
    });

    // Calculate overall statistics
    const totalModules = modules.length;
    const completedModules = enrichedProgress.filter(p => p.isCompleted).length;
    const totalTimeSpent = enrichedProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const averageScore = quizResults.length > 0
      ? Math.round(quizResults.reduce((sum, r) => sum + r.percentage, 0) / quizResults.length)
      : 0;

    return {
      quizResults: quizResults.map(result => ({
        quizId: result.quizId,
        score: result.score,
        percentage: result.percentage,
        completedAt: result.completedAt,
        timeSpent: result.timeSpent,
        totalQuestions: result.totalQuestions,
      })),
      progressData: enrichedProgress,
      overallStats: {
        totalModules,
        completedModules,
        averageScore,
        totalTimeSpent,
        completionRate: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
        totalQuizzes: quizResults.length,
        passedQuizzes: quizResults.filter(r => r.percentage >= 70).length,
      },
    };
  },
});

// Get quiz performance trends
export const getQuizPerformanceTrends = query({
  args: {
    timeframe: v.optional(v.string()), // "week", "month", "quarter", "year"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const timeframe = args.timeframe || "month";
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const quizResults = await ctx.db
      .query("quizResults")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.gte(q.field("completedAt"), startDate.getTime())
        )
      )
      .order("asc")
      .collect();

    // Group results by time periods
    const trends = new Map();
    
    quizResults.forEach(result => {
      const date = new Date(result.completedAt);
      let periodKey: string;

      if (timeframe === "week") {
        periodKey = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (timeframe === "year") {
        periodKey = date.toLocaleDateString('en-US', { month: 'short' });
      } else {
        periodKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      if (!trends.has(periodKey)) {
        trends.set(periodKey, {
          period: periodKey,
          totalAttempts: 0,
          totalScore: 0,
          passedQuizzes: 0,
          averageScore: 0,
          bestScore: 0,
        });
      }

      const periodData = trends.get(periodKey);
      periodData.totalAttempts++;
      periodData.totalScore += result.percentage;
      periodData.bestScore = Math.max(periodData.bestScore, result.percentage);
      if (result.percentage >= 70) {
        periodData.passedQuizzes++;
      }
      periodData.averageScore = Math.round(periodData.totalScore / periodData.totalAttempts);
    });

    return Array.from(trends.values());
  },
});

// Get module completion analytics
export const getModuleCompletionAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    // Get all modules and user progress
    const modules = await ctx.db
      .query("trainingModules")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const userProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_module", (q) => q.eq("userId", user._id))
      .collect();

    // Create progress map
    const progressMap = new Map(userProgress.map(p => [p.moduleId, p]));

    // Analyze each module
    const moduleAnalytics = modules.map(module => {
      const progress = progressMap.get(module._id);
      const isCompleted = progress ? (progress.completedAt || 0) > 0 : false;
      const hasStarted = progress ? (progress.lastAccessedAt || 0) > 0 : false;

      return {
        moduleId: module._id,
        title: module.title,
        category: module.category,
        isRequired: module.isRequired,
        estimatedDuration: module.estimatedDuration,
        difficulty: module.difficulty,
        status: isCompleted ? "completed" : hasStarted ? "in_progress" : "not_started",
        quizScore: progress?.quizScore || 0,
        timeSpent: progress?.timeSpent || 0,
        completedAt: progress?.completedAt || 0,
        lastAccessedAt: progress?.lastAccessedAt || 0,
        hasQuiz: !!module.quizId,
      };
    });

    // Calculate category statistics
    const categoryStats = new Map();
    moduleAnalytics.forEach(module => {
      if (!categoryStats.has(module.category)) {
        categoryStats.set(module.category, {
          category: module.category,
          totalModules: 0,
          completedModules: 0,
          averageScore: 0,
          totalTimeSpent: 0,
          completionRate: 0,
        });
      }

      const stats = categoryStats.get(module.category);
      stats.totalModules++;
      if (module.status === "completed") {
        stats.completedModules++;
        stats.totalTimeSpent += module.timeSpent;
      }
      stats.completionRate = Math.round((stats.completedModules / stats.totalModules) * 100);
    });

    return {
      modules: moduleAnalytics,
      categoryStats: Array.from(categoryStats.values()),
      summary: {
        totalModules: modules.length,
        requiredModules: modules.filter(m => m.isRequired).length,
        completedModules: moduleAnalytics.filter(m => m.status === "completed").length,
        inProgressModules: moduleAnalytics.filter(m => m.status === "in_progress").length,
        notStartedModules: moduleAnalytics.filter(m => m.status === "not_started").length,
      },
    };
  },
});

// Get comparative performance data
export const getComparativePerformance = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get user's results
    const userResults = await ctx.db
      .query("quizResults")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    // Get all quiz results for comparison (anonymized)
    const allResults = await ctx.db
      .query("quizResults")
      .collect();

    if (userResults.length === 0) {
      return null;
    }

    const userAverageScore = userResults.reduce((sum, r) => sum + r.percentage, 0) / userResults.length;
    const globalAverageScore = allResults.reduce((sum, r) => sum + r.percentage, 0) / allResults.length;

    // Calculate percentiles
    const allScores = allResults.map(r => r.percentage).sort((a, b) => a - b);
    const userBestScore = Math.max(...userResults.map(r => r.percentage));
    
    const getUserPercentile = (score: number) => {
      const lowerScores = allScores.filter(s => s < score).length;
      return Math.round((lowerScores / allScores.length) * 100);
    };

    return {
      userStats: {
        averageScore: Math.round(userAverageScore),
        bestScore: userBestScore,
        totalAttempts: userResults.length,
        passedQuizzes: userResults.filter(r => r.percentage >= 70).length,
        averagePercentile: getUserPercentile(userAverageScore),
        bestPercentile: getUserPercentile(userBestScore),
      },
      globalStats: {
        averageScore: Math.round(globalAverageScore),
        totalParticipants: new Set(allResults.map(r => r.userId)).size,
        totalQuizAttempts: allResults.length,
      },
      comparison: {
        scoreVsAverage: Math.round(userAverageScore - globalAverageScore),
        performanceTier: userAverageScore >= globalAverageScore + 10 ? "above_average" : 
                        userAverageScore <= globalAverageScore - 10 ? "below_average" : "average",
      },
    };
  },
});