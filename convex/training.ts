import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./rbac";

// List all active training modules (public query)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("trainingModules")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

// List training modules by category
export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("trainingModules")
      .filter((q) => q.and(
        q.eq(q.field("category"), args.category),
        q.eq(q.field("status"), "active")
      ))
      .collect();
  },
});

// List required training modules for user role
export const getRequiredTraining = query({
  args: { userRole: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("trainingModules")
      .filter((q) => q.and(
        q.eq(q.field("isRequired"), true),
        q.eq(q.field("status"), "active")
      ))
      .collect();
  },
});

// Get all training modules (Admin only)
export const getAllModules = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    return await ctx.db.query("trainingModules").collect();
  },
});

// Get a single training module (public query)
export const get = query({
  args: { id: v.id("trainingModules") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new training module (Admin only)
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal("video"), v.literal("document")),
    contentUrl: v.string(),
    quizId: v.optional(v.id("quizzes")),
  },
  handler: async (ctx, args) => {
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);

    const identity = await ctx.auth.getUserIdentity();
    const now = Date.now();

    return await ctx.db.insert("trainingModules", {
      title: args.title,
      description: args.description,
      type: args.type,
      category: "general_security",
      difficulty: "beginner",
      estimatedDuration: 30,
      contentUrl: args.contentUrl,
      learningObjectives: [],
      isRequired: false,
      targetAudience: ["all_employees"],
      tags: [],
      quizId: args.quizId,
      version: "1.0",
      status: "draft",
      createdBy: identity?.subject || "unknown",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Enhanced create training module (Admin only)
export const createEnhancedModule = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    summary: v.optional(v.string()),
    type: v.union(
      v.literal("video"), 
      v.literal("document"), 
      v.literal("interactive"), 
      v.literal("simulation"),
      v.literal("assessment")
    ),
    category: v.string(),
    difficulty: v.string(),
    estimatedDuration: v.number(),
    contentUrl: v.string(),
    content: v.optional(v.string()),
    learningObjectives: v.array(v.string()),
    isRequired: v.boolean(),
    targetAudience: v.array(v.string()),
    complianceFramework: v.optional(v.array(v.string())),
    tags: v.array(v.string()),
    quizId: v.optional(v.id("quizzes")),
    passScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);

    const identity = await ctx.auth.getUserIdentity();
    const now = Date.now();

    return await ctx.db.insert("trainingModules", {
      ...args,
      version: "1.0",
      status: "draft",
      createdBy: identity?.subject || "unknown",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a training module (Admin only)
export const update = mutation({
  args: {
    id: v.id("trainingModules"),
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal("video"), v.literal("document")),
    contentUrl: v.string(),
    quizId: v.optional(v.id("quizzes")),
  },
  handler: async (ctx, args) => {
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);

    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Enhanced update training module (Admin only)
export const updateEnhancedModule = mutation({
  args: {
    id: v.id("trainingModules"),
    title: v.string(),
    description: v.string(),
    summary: v.optional(v.string()),
    type: v.union(
      v.literal("video"), 
      v.literal("document"), 
      v.literal("interactive"), 
      v.literal("simulation"),
      v.literal("assessment")
    ),
    category: v.string(),
    difficulty: v.string(),
    estimatedDuration: v.number(),
    contentUrl: v.string(),
    content: v.optional(v.string()),
    learningObjectives: v.array(v.string()),
    isRequired: v.boolean(),
    targetAudience: v.array(v.string()),
    complianceFramework: v.optional(v.array(v.string())),
    tags: v.array(v.string()),
    quizId: v.optional(v.id("quizzes")),
    passScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);

    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Approve and activate a training module (Admin only)
export const approveModule = mutation({
  args: {
    id: v.id("trainingModules"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    
    const identity = await ctx.auth.getUserIdentity();
    
    return await ctx.db.patch(args.id, {
      status: "active",
      approvedBy: identity?.subject || "unknown",
      approvedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Delete a training module (Admin only)
export const remove = mutation({
  args: { id: v.id("trainingModules") },
  handler: async (ctx, args) => {
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);

    return await ctx.db.delete(args.id);
  },
});

// Get training statistics (Admin only)
export const getTrainingStats = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    
    const modules = await ctx.db.query("trainingModules").collect();
    const progress = await ctx.db.query("userProgress").collect();
    
    return {
      totalModules: modules.length,
      activeModules: modules.filter(m => m.status === "active").length,
      requiredModules: modules.filter(m => m.isRequired).length,
      completionRate: progress.filter(p => p.completedAt > 0).length / Math.max(progress.length, 1) * 100,
    };
  },
});