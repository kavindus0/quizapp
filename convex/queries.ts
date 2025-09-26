import { v } from "convex/values";
import { query } from "./_generated/server";

// Policy queries
export const getPolicies = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("policies").collect();
  },
});

export const getPolicyById = query({
  args: { id: v.id("policies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Training module queries
export const getTrainingModules = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("trainingModules").collect();
  },
});

export const getTrainingModuleById = query({
  args: { id: v.id("trainingModules") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Quiz queries
export const getQuizzes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("quizzes").collect();
  },
});

export const getQuizById = query({
  args: { id: v.id("quizzes") },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.id);
    if (!quiz) return null;

    // Don't return correct answers in the quiz data for security
    return {
      ...quiz,
      questions: quiz.questions.map(q => ({
        ...q,
        correctAnswerIndex: undefined, // Hide correct answers
      }))
    };
  },
});

// User progress queries
export const getUserProgress = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_module", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getUserModuleProgress = query({
  args: {
    userId: v.id("users"),
    moduleId: v.id("trainingModules")
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_module", (q) =>
        q.eq("userId", args.userId).eq("moduleId", args.moduleId)
      )
      .first();
  },
});