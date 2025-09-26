import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./rbac";

// Get all active policies (public query for employees)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("policies")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

// Get all policies including drafts (Admin only)
export const getAllPolicies = query({
  args: {},
  handler: async (ctx) => {
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);
    return await ctx.db.query("policies").collect();
  },
});

// Create a new policy (Admin only)
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);

    const identity = await ctx.auth.getUserIdentity();
    const now = Date.now();
    
    return await ctx.db.insert("policies", {
      title: args.title,
      content: args.content,
      summary: args.title, // Default summary
      category: "general_security",
      version: "1.0",
      effectiveDate: now,
      status: "draft",
      createdBy: identity?.subject || "unknown",
      requiresAcknowledgment: true,
      issuedNotifications: false,
      tags: [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update an existing policy (Admin only)
export const update = mutation({
  args: {
    id: v.id("policies"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);

    return await ctx.db.patch(args.id, {
      title: args.title,
      content: args.content,
    });
  },
});

// Delete a policy (Admin only)
export const remove = mutation({
  args: {
    id: v.id("policies"),
  },
  handler: async (ctx, args) => {
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);

    return await ctx.db.delete(args.id);
  },
});

// Enhanced create policy for Royal Credit Recoveries (Admin only)
export const createPolicy = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    summary: v.string(),
    category: v.string(),
    version: v.string(),
    effectiveDate: v.number(),
    expiryDate: v.optional(v.number()),
    requiresAcknowledgment: v.boolean(),
    acknowledgmentDeadline: v.optional(v.number()),
    tags: v.array(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);
    
    return await ctx.db.insert("policies", {
      title: args.title,
      content: args.content,
      summary: args.summary,
      category: args.category,
      version: args.version,
      effectiveDate: args.effectiveDate,
      expiryDate: args.expiryDate,
      status: "draft",
      createdBy: args.createdBy,
      requiresAcknowledgment: args.requiresAcknowledgment,
      acknowledgmentDeadline: args.acknowledgmentDeadline,
      issuedNotifications: false,
      tags: args.tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Enhanced update policy (Admin only)
export const updatePolicy = mutation({
  args: {
    id: v.id("policies"),
    title: v.string(),
    content: v.string(),
    summary: v.string(),
    category: v.string(),
    version: v.string(),
    effectiveDate: v.number(),
    expiryDate: v.optional(v.number()),
    requiresAcknowledgment: v.boolean(),
    acknowledgmentDeadline: v.optional(v.number()),
    tags: v.array(v.string()),
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

// Approve and activate a policy (Admin only)
export const approvePolicy = mutation({
  args: {
    id: v.id("policies"),
    approvedBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);
    
    return await ctx.db.patch(args.id, {
      status: "active",
      approvedBy: args.approvedBy,
      approvedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Delete a policy (Admin only) - alias
export const deletePolicy = mutation({
  args: { id: v.id("policies") },
  handler: async (ctx, args) => {
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);
    
    return await ctx.db.delete(args.id);
  },
});

// Get policy acknowledgments (Admin only)
export const getPolicyAcknowledgments = query({
  args: {},
  handler: async (ctx) => {
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);
    
    return await ctx.db.query("policyAcknowledgments").collect();
  },
});

// Acknowledge a policy (Employee action)
export const acknowledgePolicy = mutation({
  args: {
    policyId: v.id("policies"),
    userId: v.string(),
    acknowledgedVersion: v.string(),
    method: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Check if user has already acknowledged this policy version
    const existing = await ctx.db.query("policyAcknowledgments")
      .filter((q) => q.and(
        q.eq(q.field("policyId"), args.policyId),
        q.eq(q.field("userId"), args.userId),
        q.eq(q.field("acknowledgedVersion"), args.acknowledgedVersion)
      ))
      .first();
      
    if (existing) {
      throw new Error("Policy already acknowledged");
    }
    
    return await ctx.db.insert("policyAcknowledgments", {
      policyId: args.policyId,
      userId: args.userId,
      acknowledgedAt: Date.now(),
      acknowledgedVersion: args.acknowledgedVersion,
      method: args.method || "digital_signature",
    });
  },
});