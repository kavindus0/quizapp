import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Real-time progress tracking system for modules, quizzes, and overall completion

// Get comprehensive real-time user progress
export const getRealtimeProgress = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Find user in database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    // Get all training modules
    const modules = await ctx.db
      .query("trainingModules")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get user's progress on all modules
    const userProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_module", (q) => q.eq("userId", user._id))
      .collect();

    // Get user's quiz results
    const quizResults = await ctx.db
      .query("quizResults")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    // Get user's certificates
    const certificates = await ctx.db
      .query("certifications")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    // Calculate comprehensive progress statistics
    const requiredModules = modules.filter(m => m.isRequired);
    const optionalModules = modules.filter(m => !m.isRequired);
    
    const completedModules = userProgress.filter(p => p.completedAt > 0);
    const completedRequiredModules = completedModules.filter(p => 
      requiredModules.some(m => m._id === p.moduleId)
    );

    const passedQuizzes = quizResults.filter(r => r.percentage >= 70);
    const activeCertificates = certificates.filter(c => c.status === "active");

    // Calculate overall completion percentage
    const totalRequiredItems = requiredModules.length;
    const completedRequiredItems = completedRequiredModules.length;
    const overallProgress = totalRequiredItems > 0 
      ? Math.round((completedRequiredItems / totalRequiredItems) * 100)
      : 100;

    // Calculate average quiz score
    const averageQuizScore = quizResults.length > 0
      ? Math.round(quizResults.reduce((sum, r) => sum + r.percentage, 0) / quizResults.length)
      : 0;

    // Determine compliance status
    const isFullyCompliant = completedRequiredItems === totalRequiredItems;
    const hasRecentActivity = userProgress.some(p => 
      p.completedAt > Date.now() - (7 * 24 * 60 * 60 * 1000) // Last 7 days
    );

    return {
      userId: user._id,
      clerkId: identity.subject,
      overallProgress,
      isFullyCompliant,
      hasRecentActivity,
      modules: {
        total: modules.length,
        required: requiredModules.length,
        optional: optionalModules.length,
        completed: completedModules.length,
        completedRequired: completedRequiredModules.length,
        remaining: totalRequiredItems - completedRequiredItems
      },
      quizzes: {
        attempted: quizResults.length,
        passed: passedQuizzes.length,
        averageScore: averageQuizScore,
        bestScore: quizResults.length > 0 
          ? Math.max(...quizResults.map(r => r.percentage))
          : 0
      },
      certificates: {
        total: certificates.length,
        active: activeCertificates.length,
        expired: certificates.filter(c => c.status === "expired").length
      },
      lastActivity: userProgress.length > 0 
        ? Math.max(...userProgress.map(p => p.completedAt || 0))
        : 0,
      progressHistory: userProgress.map(p => ({
        moduleId: p.moduleId,
        completedAt: p.completedAt,
        quizScore: p.quizScore
      })).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0)).slice(0, 10)
    };
  },
});

// Real-time module status update
export const updateModuleStatus = mutation({
  args: {
    moduleId: v.id("trainingModules"),
    status: v.union(v.literal("not_started"), v.literal("in_progress"), v.literal("completed")),
    quizScore: v.optional(v.number()),
    timeSpent: v.optional(v.number()),
    completionMethod: v.optional(v.string()) // "video_watched", "quiz_passed", "manual"
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

    if (!user) {
      throw new Error("User not found");
    }

    // Get or create progress record
    const existingProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_module", (q) =>
        q.eq("userId", user._id).eq("moduleId", args.moduleId)
      )
      .first();

    const now = Date.now();
    const progressData = {
      quizScore: args.quizScore,
      timeSpent: args.timeSpent,
      completedAt: args.status === "completed" ? now : (existingProgress?.completedAt || 0),
      lastAccessedAt: now,
      completionMethod: args.completionMethod,
    };

    if (existingProgress) {
      await ctx.db.patch(existingProgress._id, progressData);
      return existingProgress._id;
    } else {
      return await ctx.db.insert("userProgress", {
        userId: user._id,
        moduleId: args.moduleId,
        ...progressData
      });
    }
  },
});

// Mark module as started (when user begins a module)
export const startModule = mutation({
  args: {
    moduleId: v.id("trainingModules")
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

    if (!user) {
      throw new Error("User not found");
    }

    const existingProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_module", (q) =>
        q.eq("userId", user._id).eq("moduleId", args.moduleId)
      )
      .first();

    const now = Date.now();
    if (existingProgress) {
      return await ctx.db.patch(existingProgress._id, {
        lastAccessedAt: now,
        completionMethod: "started"
      });
    } else {
      return await ctx.db.insert("userProgress", {
        userId: user._id,
        moduleId: args.moduleId,
        completedAt: 0,
        lastAccessedAt: now,
        completionMethod: "started"
      });
    }
  },
});

// Mark module as completed (when user finishes a module)
export const completeModule = mutation({
  args: {
    moduleId: v.id("trainingModules"),
    quizScore: v.optional(v.number()),
    timeSpent: v.optional(v.number()),
    completionMethod: v.optional(v.string())
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

    if (!user) {
      throw new Error("User not found");
    }

    const existingProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_module", (q) =>
        q.eq("userId", user._id).eq("moduleId", args.moduleId)
      )
      .first();

    const now = Date.now();
    const progressData = {
      quizScore: args.quizScore,
      timeSpent: args.timeSpent,
      completedAt: now,
      lastAccessedAt: now,
      completionMethod: args.completionMethod || "completed",
    };

    let result;
    if (existingProgress) {
      result = await ctx.db.patch(existingProgress._id, progressData);
    } else {
      result = await ctx.db.insert("userProgress", {
        userId: user._id,
        moduleId: args.moduleId,
        ...progressData
      });
    }

    return result;
  },
});

// Update quiz completion status in real-time
export const updateQuizCompletion = mutation({
  args: {
    quizId: v.id("quizzes"),
    moduleId: v.optional(v.id("trainingModules")),
    score: v.number(),
    percentage: v.number(),
    passed: v.boolean(),
    timeSpent: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // If quiz is associated with a module, update module progress
    if (args.moduleId) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .first();

      if (!user) {
        throw new Error("User not found");
      }

      const existingProgress = await ctx.db
        .query("userProgress")
        .withIndex("by_user_and_module", (q) =>
          q.eq("userId", user._id).eq("moduleId", args.moduleId!)
        )
        .first();

      const now = Date.now();
      const progressData = {
        quizScore: args.percentage,
        lastAccessedAt: now,
        timeSpent: args.timeSpent,
        completionMethod: args.passed ? "quiz_passed" : "quiz_attempted",
        ...(args.passed && { completedAt: now })
      };

      if (existingProgress) {
        await ctx.db.patch(existingProgress._id, progressData);
      } else {
        const insertData = {
          userId: user._id,
          moduleId: args.moduleId,
          quizScore: args.percentage,
          lastAccessedAt: now,
          timeSpent: args.timeSpent,
          completionMethod: args.passed ? "quiz_passed" : "quiz_attempted",
          completedAt: args.passed ? now : 0 // Set to 0 if not completed
        };
        await ctx.db.insert("userProgress", insertData);
      }
    }

    return [];
  },
});

// Get real-time progress for a specific module
export const getModuleRealtimeStatus = query({
  args: { 
    moduleId: v.id("trainingModules") 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null;
    }

    // Get module details
    const module = await ctx.db.get(args.moduleId);
    if (!module) {
      return null;
    }

    // Get user's progress on this module
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_module", (q) =>
        q.eq("userId", user._id).eq("moduleId", args.moduleId)
      )
      .first();

    // Get quiz results for this module's quiz (if any)
    let quizResult = null;
    if (module.quizId) {
      quizResult = await ctx.db
        .query("quizResults")
        .filter((q) => q.and(
          q.eq(q.field("userId"), identity.subject),
          q.eq(q.field("quizId"), module.quizId)
        ))
        .order("desc")
        .first();
    }

    // Determine current status
    let status = "not_started";
    if (progress) {
      if (progress.completedAt > 0) {
        status = "completed";
      } else if (progress.lastAccessedAt) {
        status = "in_progress";
      }
    }

    return {
      moduleId: args.moduleId,
      status,
      progress: progress || null,
      quizResult: quizResult || null,
      isRequired: module.isRequired || false,
      hasQuiz: !!module.quizId,
      lastAccessed: progress?.lastAccessedAt || 0,
      completedAt: progress?.completedAt || 0,
      quizScore: progress?.quizScore || quizResult?.percentage || 0,
      timeSpent: progress?.timeSpent || 0
    };
  },
});

// Bulk update progress for multiple modules (useful for admin operations)
export const bulkUpdateProgress = mutation({
  args: {
    updates: v.array(v.object({
      moduleId: v.id("trainingModules"),
      userId: v.string(),
      status: v.union(v.literal("not_started"), v.literal("in_progress"), v.literal("completed")),
      quizScore: v.optional(v.number()),
      completedAt: v.optional(v.number())
    }))
  },
  handler: async (ctx, args) => {
    // This could be used for admin bulk operations or data migration
    const results = [];
    
    for (const update of args.updates) {
      try {
        // Find the user
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", update.userId))
          .first();

        if (!user) continue;

        // Get or create progress record
        const existingProgress = await ctx.db
          .query("userProgress")
          .withIndex("by_user_and_module", (q) =>
            q.eq("userId", user._id).eq("moduleId", update.moduleId)
          )
          .first();

        const progressData = {
          quizScore: update.quizScore,
          completedAt: update.status === "completed" 
            ? (update.completedAt || Date.now()) 
            : (existingProgress?.completedAt || 0),
          lastAccessedAt: Date.now(),
        };

        let resultId;
        if (existingProgress) {
          await ctx.db.patch(existingProgress._id, progressData);
          resultId = existingProgress._id;
        } else {
          resultId = await ctx.db.insert("userProgress", {
            userId: user._id,
            moduleId: update.moduleId,
            ...progressData
          });
        }

        results.push({ success: true, id: resultId, moduleId: update.moduleId });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.push({ success: false, error: errorMessage, moduleId: update.moduleId });
      }
    }

    return results;
  },
});

// Get progress statistics for dashboard widgets
export const getProgressStats = query({
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

    if (!user) {
      return null;
    }

    // Get all active modules
    const modules = await ctx.db
      .query("trainingModules")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get user's progress
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_module", (q) => q.eq("userId", user._id))
      .collect();

    // Get quiz results
    const quizResults = await ctx.db
      .query("quizResults")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    const requiredModules = modules.filter(m => m.isRequired);
    const completedProgress = progress.filter(p => p.completedAt > 0);
    const completedRequired = completedProgress.filter(p => 
      requiredModules.some(m => m._id === p.moduleId)
    );

    const passedQuizzes = quizResults.filter(r => r.percentage >= 70);
    
    return {
      totalModules: modules.length,
      requiredModules: requiredModules.length,
      completedModules: completedProgress.length,
      completedRequired: completedRequired.length,
      completionRate: requiredModules.length > 0 
        ? Math.round((completedRequired.length / requiredModules.length) * 100)
        : 100,
      quizzesAttempted: quizResults.length,
      quizzesPassed: passedQuizzes.length,
      averageScore: quizResults.length > 0
        ? Math.round(quizResults.reduce((sum, r) => sum + r.percentage, 0) / quizResults.length)
        : 0,
      recentActivity: progress
        .filter(p => p.lastAccessedAt && p.lastAccessedAt > Date.now() - (7 * 24 * 60 * 60 * 1000))
        .length,
      lastActiveDate: progress.length > 0 
        ? Math.max(...progress.map(p => p.lastAccessedAt || p.completedAt || 0))
        : 0
    };
  },
});