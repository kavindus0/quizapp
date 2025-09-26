import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get user progress for all modules (Employee only)
export const getUserProgress = query({
  args: {},
  handler: async (ctx) => {
    // Check if user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return []; // Return empty array for unauthenticated users
    }

    // Find user in database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return []; // Return empty array if user not found
    }

    // Only employees can view their own progress
    if (user.role !== "employee") {
      return []; // Return empty array for non-employees
    }

    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_module", (q) => q.eq("userId", user._id))
      .collect();

    return progress;
  },
});

// Get progress for a specific module (Employee only)
export const getModuleProgress = query({
  args: { moduleId: v.id("trainingModules") },
  handler: async (ctx, args) => {
    // Check if user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null; // Return null for unauthenticated users
    }

    // Find user in database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return null; // Return null if user not found
    }

    // Only employees can view their own progress
    if (user.role !== "employee") {
      return null; // Return null for non-employees
    }

    return await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_module", (q) =>
        q.eq("userId", user._id).eq("moduleId", args.moduleId)
      )
      .first();
  },
});

// Update or create progress for a module (Employee only)
export const updateProgress = mutation({
  args: {
    moduleId: v.id("trainingModules"),
    quizScore: v.optional(v.number()),
    completedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find user in database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Only employees can update their own progress
    if (user.role !== "employee") {
      throw new Error("Only employees can update progress");
    }

    // Check if progress already exists
    const existingProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_module", (q) =>
        q.eq("userId", user._id).eq("moduleId", args.moduleId)
      )
      .first();

    if (existingProgress) {
      // Update existing progress
      await ctx.db.patch(existingProgress._id, {
        quizScore: args.quizScore,
        completedAt: args.completedAt,
      });
    } else {
      // Create new progress record
      await ctx.db.insert("userProgress", {
        userId: user._id,
        moduleId: args.moduleId,
        quizScore: args.quizScore,
        completedAt: args.completedAt,
      });
    }
  },
});