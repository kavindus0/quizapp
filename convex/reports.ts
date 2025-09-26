import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./rbac";

// Get comprehensive compliance report (Admin only)
export const getComplianceReport = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    // Only admins can view compliance reports
    if (user.role !== "admin") {
      throw new Error("Only admins can view compliance reports");
    }

    // Get all users
    const users = await ctx.db.query("users").collect();
    const totalUsers = users.length;

    // Get all user progress
    const allProgress = await ctx.db.query("userProgress").collect();

    // Calculate completion statistics
    // Consider a module completed if there's progress with a completedAt timestamp
    const completedUsers = new Set(
      allProgress.filter(p => p.completedAt > 0).map(p => p.userId)
    ).size;

    // Users with progress but not completed
    const inProgressUsers = new Set(
      allProgress.filter(p => p.completedAt === 0).map(p => p.userId)
    ).size;

    const notStartedUsers = totalUsers - completedUsers - inProgressUsers;

    // Calculate average quiz scores (only for entries with quiz scores)
    const quizProgress = allProgress.filter(p => p.quizScore !== undefined && p.quizScore >= 0);
    const averageScore = quizProgress.length > 0
      ? quizProgress.reduce((sum, p) => sum + (p.quizScore || 0), 0) / quizProgress.length
      : 0;

    // Get module completion breakdown
    const modules = await ctx.db.query("trainingModules").collect();
    const moduleCompletion = await Promise.all(
      modules.map(async (module) => {
        const moduleProgress = allProgress.filter(p => p.moduleId === module._id);
        const completed = moduleProgress.filter(p => p.completedAt > 0).length;
        const total = users.length;

        return {
          moduleId: module._id,
          moduleName: module.title,
          completed,
          total,
          completionRate: total > 0 ? (completed / total) * 100 : 0,
        };
      })
    );

    // Get quiz results summary (using training modules that have quizzes)
    const quizModules = modules.filter(m => m.quizId);
    const quizResults = await Promise.all(
      quizModules.map(async (module) => {
        const quiz = await ctx.db.get(module.quizId!);
        if (!quiz) return null;

        const moduleProgress = allProgress.filter(p => p.moduleId === module._id && p.quizScore !== undefined);
        const passed = moduleProgress.filter(p => (p.quizScore || 0) >= 70).length; // Default passing score of 70%
        const total = moduleProgress.length;

        return {
          quizId: quiz._id,
          quizName: quiz.title,
          passed,
          total,
          passRate: total > 0 ? (passed / total) * 100 : 0,
        };
      }).filter(Boolean)
    );

    return {
      totalUsers,
      completedUsers,
      inProgressUsers,
      notStartedUsers,
      averageScore: Math.round(averageScore * 100) / 100,
      moduleCompletion,
      quizResults,
    };
  },
});

// Get detailed user progress report (Admin only)
export const getUserProgressReport = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    // Only admins can view user progress reports
    if (user.role !== "admin") {
      throw new Error("Only admins can view user progress reports");
    }

    const users = await ctx.db.query("users").collect();
    const allProgress = await ctx.db.query("userProgress").collect();

    return await Promise.all(
      users.map(async (user) => {
        const userProgress = allProgress.filter(p => p.userId === user._id);
        const completedModules = userProgress.filter(p => p.completedAt > 0).length;
        const totalModules = (await ctx.db.query("trainingModules").collect()).length;

        return {
          userId: user._id,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          userEmail: user.email,
          completedModules,
          totalModules,
          completionRate: totalModules > 0 ? (completedModules / totalModules) * 100 : 0,
          lastActivity: userProgress.length > 0
            ? Math.max(...userProgress.map(p => p.completedAt))
            : null,
        };
      })
    );
  },
});

// Get comprehensive training statistics
export const getTrainingStats = query({
  handler: async (ctx) => {
    const modules = await ctx.db.query("trainingModules").collect();
    const progress = await ctx.db.query("userProgress").collect();
    const users = await ctx.db.query("users").collect();

    const totalUsers = users.length;
    const completedModules = progress.filter(p => p.completedAt > 0).length;
    const totalModulesPerUser = modules.length;
    const totalPossibleCompletions = totalUsers * totalModulesPerUser;
    
    const completionRate = totalPossibleCompletions > 0 
      ? (completedModules / totalPossibleCompletions) * 100 
      : 0;

    // Calculate quiz statistics
    const quizScores = progress.filter(p => p.quizScore !== undefined && p.quizScore >= 0);
    const averageScore = quizScores.length > 0
      ? quizScores.reduce((sum, p) => sum + (p.quizScore || 0), 0) / quizScores.length
      : 0;

    const passedQuizzes = quizScores.filter(p => (p.quizScore || 0) >= 70).length;
    const passRate = quizScores.length > 0 ? (passedQuizzes / quizScores.length) * 100 : 0;

    return {
      totalModules: modules.length,
      totalUsers,
      completedModules,
      completionRate,
      averageScore: Math.round(averageScore * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      moduleStats: modules.map(module => {
        const moduleProgress = progress.filter(p => p.moduleId === module._id);
        const moduleCompleted = moduleProgress.filter(p => p.completedAt > 0).length;
        return {
          id: module._id,
          title: module.title,
          category: module.category,
          totalEnrolled: moduleProgress.length,
          completed: moduleCompleted,
          completionRate: moduleProgress.length > 0 
            ? (moduleCompleted / moduleProgress.length) * 100 
            : 0
        };
      })
    };
  }
});



// Get all quiz results for admin dashboard
export const getAllQuizResults = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    // Only admins can view all quiz results
    if (user.role !== "admin") {
      throw new Error("Only admins can view all quiz results");
    }

    const results = await ctx.db
      .query("quizResults")
      .collect();

    // Get user info and quiz info for each result
    const enrichedResults = await Promise.all(
      results.map(async (result) => {
        // Find user by clerkId stored in result.userId
        const resultUser = await ctx.db
          .query("users")
          .filter(q => q.eq(q.field("clerkId"), result.userId))
          .first();
        const quiz = await ctx.db.get(result.quizId);
        
        return {
          ...result,
          userEmail: resultUser?.email || "Unknown",
          userName: resultUser ? `${resultUser.firstName || ''} ${resultUser.lastName || ''}`.trim() || resultUser.email : "Unknown User",
          quizTitle: quiz?.title || "Unknown Quiz",
          passed: result.percentage >= 70, // Calculate passed based on percentage
        };
      })
    );

    return enrichedResults;
  },
});

// Get quiz statistics summary
export const getQuizStatistics = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    // Only admins can view quiz statistics
    if (user.role !== "admin") {
      throw new Error("Only admins can view quiz statistics");
    }

    const results = await ctx.db.query("quizResults").collect();
    const quizzes = await ctx.db.query("quizzes").collect();
    const users = await ctx.db.query("users").collect();

    // Calculate overall statistics
    const totalAttempts = results.length;
    const passedAttempts = results.filter(r => r.percentage >= 70).length;
    const averageScore = results.length > 0 
      ? results.reduce((sum, r) => sum + (r.score / r.totalQuestions), 0) / results.length * 100
      : 0;

    // Quiz-specific statistics
    const quizStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const quizResults = results.filter(r => r.quizId === quiz._id);
        const attempts = quizResults.length;
        const passes = quizResults.filter(r => r.percentage >= 70).length;
        const avgScore = attempts > 0 
          ? quizResults.reduce((sum, r) => sum + (r.score / r.totalQuestions), 0) / attempts * 100
          : 0;

        return {
          quizId: quiz._id,
          quizTitle: quiz.title,
          attempts,
          passes,
          passRate: attempts > 0 ? (passes / attempts) * 100 : 0,
          averageScore: avgScore,
        };
      })
    );

    // User performance statistics
    const userStats = await Promise.all(
      users.map(async (userData) => {
        const userResults = results.filter(r => r.userId === userData._id);
        const completedQuizzes = userResults.length;
        const passedQuizzes = userResults.filter(r => r.percentage >= 70).length;
        const avgScore = completedQuizzes > 0 
          ? userResults.reduce((sum, r) => sum + (r.score / r.totalQuestions), 0) / completedQuizzes * 100
          : 0;

        return {
          userId: userData._id,
          userEmail: userData.email,
          userName: userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.email,
          completedQuizzes,
          passedQuizzes,
          passRate: completedQuizzes > 0 ? (passedQuizzes / completedQuizzes) * 100 : 0,
          averageScore: avgScore,
        };
      })
    );

    return {
      overall: {
        totalQuizzes: quizzes.length,
        totalUsers: users.length,
        totalAttempts,
        passedAttempts,
        passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
        averageScore,
      },
      byQuiz: quizStats,
      byUser: userStats.filter(u => u.completedQuizzes > 0), // Only show users who have taken quizzes
    };
  },
});

// Get detailed results for a specific quiz
export const getQuizResultsDetail = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Only admins can view detailed quiz results
    if (user.role !== "admin") {
      throw new Error("Only admins can view detailed quiz results");
    }

    const results = await ctx.db
      .query("quizResults")
      .filter((q) => q.eq(q.field("quizId"), args.quizId))
      .collect();

    const quiz = await ctx.db.get(args.quizId);
    
    const enrichedResults = await Promise.all(
      results.map(async (result) => {
        // Find user by clerkId stored in result.userId
        const resultUser = await ctx.db
          .query("users")
          .filter(q => q.eq(q.field("clerkId"), result.userId))
          .first();
        
        return {
          ...result,
          userEmail: resultUser?.email || "Unknown",
          userName: resultUser ? `${resultUser.firstName || ''} ${resultUser.lastName || ''}`.trim() || resultUser.email : "Unknown User",
        };
      })
    );

    return {
      quiz,
      results: enrichedResults,
    };
  },
});

// Get training completion statistics including quiz results
export const getTrainingCompletionStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    // Only admins can view completion statistics
    if (user.role !== "admin") {
      throw new Error("Only admins can view completion statistics");
    }

    const users = await ctx.db.query("users").collect();
    const quizzes = await ctx.db.query("quizzes").collect();
    const results = await ctx.db.query("quizResults").collect();

    const completionStats = users.map(userData => {
      const userResults = results.filter(r => r.userId === userData.clerkId && r.percentage >= 70);
      const completedQuizzes = userResults.length;
      const completionRate = quizzes.length > 0 ? (completedQuizzes / quizzes.length) * 100 : 0;

      return {
        userId: userData._id,
        userEmail: userData.email,
        userName: userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.email,
        completedQuizzes,
        totalQuizzes: quizzes.length,
        completionRate,
        lastActivity: userResults.length > 0 
          ? Math.max(...userResults.map(r => new Date(r.completedAt).getTime()))
          : null,
      };
    });

    return completionStats.sort((a, b) => b.completionRate - a.completionRate);
  },
});