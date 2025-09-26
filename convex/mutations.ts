import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Policy mutations
export const createPolicy = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
    category: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("policies", {
      ...args,
      summary: args.summary || args.content.substring(0, 200) + "...",
      version: "1.0",
      effectiveDate: now,
      status: "active",
      requiresAcknowledgment: false,
      issuedNotifications: false,
      tags: [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updatePolicy = mutation({
  args: {
    id: v.id("policies"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const removePolicy = mutation({
  args: { id: v.id("policies") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Training module mutations
export const createTrainingModule = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal("video"), v.literal("document")),
    contentUrl: v.string(),
    quizId: v.optional(v.id("quizzes")),
    category: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("trainingModules", {
      ...args,
      difficulty: "beginner",
      estimatedDuration: 15,
      learningObjectives: [],
      isRequired: false,
      targetAudience: ["all_employees"],
      tags: [],
      version: "1.0",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTrainingModule = mutation({
  args: {
    id: v.id("trainingModules"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.union(v.literal("video"), v.literal("document"))),
    contentUrl: v.optional(v.string()),
    quizId: v.optional(v.id("quizzes")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const removeTrainingModule = mutation({
  args: { id: v.id("trainingModules") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Quiz mutations
export const createQuiz = mutation({
  args: {
    title: v.string(),
    questions: v.array(
      v.object({
        questionText: v.string(),
        options: v.array(v.string()),
        correctAnswerIndex: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quizzes", args);
  },
});

export const updateQuiz = mutation({
  args: {
    id: v.id("quizzes"),
    title: v.optional(v.string()),
    questions: v.optional(v.array(
      v.object({
        questionText: v.string(),
        options: v.array(v.string()),
        correctAnswerIndex: v.number(),
      })
    )),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const removeQuiz = mutation({
  args: { id: v.id("quizzes") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Quiz submission
export const submitQuiz = mutation({
  args: {
    quizId: v.id("quizzes"),
    userId: v.id("users"),
    answers: v.array(v.number()), // Array of selected answer indices
  },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) throw new Error("Quiz not found");

    // Calculate score
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (args.answers[index] === question.correctAnswerIndex) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / quiz.questions.length) * 100;

    // Find the training module that contains this quiz
    const trainingModule = await ctx.db
      .query("trainingModules")
      .filter(q => q.eq(q.field("quizId"), args.quizId))
      .first();

    if (!trainingModule) {
      throw new Error("No training module found for this quiz");
    }

    // Update or create progress for the training module
    const existingProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_module", (q) =>
        q.eq("userId", args.userId).eq("moduleId", trainingModule._id)
      )
      .first();

    const now = Date.now();

    if (existingProgress) {
      await ctx.db.patch(existingProgress._id, {
        quizScore: score,
        completedAt: now,
      });
    } else {
      await ctx.db.insert("userProgress", {
        userId: args.userId,
        moduleId: trainingModule._id,
        quizScore: score,
        completedAt: now,
      });
    }

    return {
      score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
    };
  },
});