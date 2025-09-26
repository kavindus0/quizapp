import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./rbac";
import { Id } from "./_generated/dataModel";

// Helper function to generate verification code
function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper function to generate certificate ID
function generateCertificateId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 9);
  return `RCR-CERT-${timestamp}-${random}`.toUpperCase();
}

// Get user's certifications
export const getUserCertifications = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Users can only see their own certifications unless they're admin
    if (identity.subject !== args.userId) {
      await requireRole(ctx, ["admin"]);
    }
    
    return await ctx.db.query("certifications")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

// Get all active certifications (Admin only)
export const getAllCertifications = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    return await ctx.db.query("certifications").collect();
  },
});

// Get certification by verification code (public for verification)
export const verifyCertificate = query({
  args: { verificationCode: v.string() },
  handler: async (ctx, args) => {
    const cert = await ctx.db.query("certifications")
      .filter((q) => q.eq(q.field("verificationCode"), args.verificationCode))
      .first();
      
    if (!cert) return null;
    
    // Return limited information for verification
    return {
      certificateId: cert.certificateId,
      title: cert.title,
      issuedAt: cert.issuedAt,
      expiresAt: cert.expiresAt,
      status: cert.status,
      issuedBy: cert.issuedBy,
      userId: cert.userId // May want to anonymize this
    };
  },
});

// Check if user is eligible for certification
export const checkCertificationEligibility = query({
  args: { 
    userId: v.string(),
    templateId: v.id("certificationTemplates")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");
    
    // Get user's progress
    const progress = await ctx.db.query("userProgress")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
      
    const quizResults = await ctx.db.query("quizResults")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    
    // Check module completion
    const completedModules = progress.filter(p => p.completedAt > 0).map(p => p.moduleId);
    const moduleRequirementsMet = template.requiredModules.every(moduleId => 
      completedModules.includes(moduleId)
    );
    
    // Check quiz completion and scores
    const quizRequirementsMet = template.requiredQuizzes.every(quizId => {
      const result = quizResults.find(r => r.quizId === quizId);
      if (!result) return false;
      if (template.minimumOverallScore && result.percentage < template.minimumOverallScore) {
        return false;
      }
      return true;
    });
    
    const overallScore = quizResults.length > 0 
      ? quizResults.reduce((sum, r) => sum + r.percentage, 0) / quizResults.length 
      : 0;
      
    const overallScoreMet = !template.minimumOverallScore || overallScore >= template.minimumOverallScore;
    
    return {
      eligible: moduleRequirementsMet && quizRequirementsMet && overallScoreMet,
      moduleRequirementsMet,
      quizRequirementsMet,
      overallScoreMet,
      overallScore,
      completedModules: completedModules.length,
      totalModules: template.requiredModules.length,
      completedQuizzes: template.requiredQuizzes.filter(qId => 
        quizResults.some(r => r.quizId === qId)
      ).length,
      totalQuizzes: template.requiredQuizzes.length
    };
  },
});

// Award certification to user
export const awardCertification = mutation({
  args: {
    userId: v.string(),
    templateId: v.id("certificationTemplates"),
    issuedBy: v.optional(v.string()),
    notes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    
    const identity = await ctx.auth.getUserIdentity();
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");
    
    // Check if user already has this certification
    const existingCert = await ctx.db.query("certifications")
      .filter((q) => q.and(
        q.eq(q.field("userId"), args.userId),
        q.eq(q.field("title"), template.title),
        q.or(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("status"), "earned")
        )
      ))
      .first();
      
    if (existingCert) {
      throw new Error("User already has an active certification of this type");
    }
    
    // Calculate expiry date
    const now = Date.now();
    const expiresAt = template.validityPeriod 
      ? now + (template.validityPeriod * 24 * 60 * 60 * 1000) 
      : undefined;
    
    // Get user's quiz results for metadata
    const quizResults = await ctx.db.query("quizResults")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
      
    const relevantQuizResults = quizResults.filter(r => 
      template.requiredQuizzes.includes(r.quizId)
    );
    
    const avgScore = relevantQuizResults.length > 0
      ? relevantQuizResults.reduce((sum, r) => sum + r.percentage, 0) / relevantQuizResults.length
      : 0;
    
    return await ctx.db.insert("certifications", {
      userId: args.userId,
      title: template.title,
      description: template.description,
      category: template.category,
      certificateType: template.certificateType,
      requirements: [
        ...template.requiredModules.map(id => ({
          type: "module",
          id: id as string,
          minimumScore: undefined,
          completed: true
        })),
        ...template.requiredQuizzes.map(id => ({
          type: "quiz", 
          id: id as string,
          minimumScore: template.minimumOverallScore,
          completed: true
        }))
      ],
      requiredModules: template.requiredModules,
      requiredQuizzes: template.requiredQuizzes,
      minimumOverallScore: template.minimumOverallScore,
      completedRequirements: [
        ...template.requiredModules,
        ...template.requiredQuizzes
      ],
      issuedAt: now,
      expiresAt,
      renewalNotificationSent: false,
      status: "active",
      certificateId: generateCertificateId(),
      verificationCode: generateVerificationCode(),
      issuedBy: args.issuedBy || identity?.subject || "system",
      complianceFramework: template.complianceFramework,
      creditsEarned: template.creditsAwarded,
      metadata: {
        finalScore: Math.round(avgScore * 100) / 100,
        timeToComplete: undefined, // Could calculate from progress data
        attemptCount: relevantQuizResults.length,
        specialNotes: args.notes
      },
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Auto-check and award eligible certifications
export const checkAndAwardEligibleCertifications = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get all active certification templates with auto-award enabled
    const templates = await ctx.db.query("certificationTemplates")
      .filter((q) => q.and(
        q.eq(q.field("isActive"), true),
        q.eq(q.field("autoAward"), true)
      ))
      .collect();
    
    const awarded = [];
    
    for (const template of templates) {
      // Check if user already has this certification
      const existingCert = await ctx.db.query("certifications")
        .filter((q) => q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("title"), template.title),
          q.or(
            q.eq(q.field("status"), "active"),
            q.eq(q.field("status"), "earned")
          )
        ))
        .first();
        
      if (existingCert) continue;
      
      // Check eligibility
      const progress = await ctx.db.query("userProgress")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .collect();
        
      const quizResults = await ctx.db.query("quizResults")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .collect();
      
      const completedModules = progress.filter(p => p.completedAt > 0).map(p => p.moduleId);
      const moduleRequirementsMet = template.requiredModules.every(moduleId => 
        completedModules.includes(moduleId)
      );
      
      const quizRequirementsMet = template.requiredQuizzes.every(quizId => {
        const result = quizResults.find(r => r.quizId === quizId);
        if (!result) return false;
        if (template.minimumOverallScore && result.percentage < template.minimumOverallScore) {
          return false;
        }
        return true;
      });
      
      if (moduleRequirementsMet && quizRequirementsMet) {
        // Award the certification
        const now = Date.now();
        const expiresAt = template.validityPeriod 
          ? now + (template.validityPeriod * 24 * 60 * 60 * 1000) 
          : undefined;
        
        const certId = await ctx.db.insert("certifications", {
          userId: args.userId,
          title: template.title,
          description: template.description,
          category: template.category,
          certificateType: template.certificateType,
          requirements: [],
          requiredModules: template.requiredModules,
          requiredQuizzes: template.requiredQuizzes,
          minimumOverallScore: template.minimumOverallScore,
          completedRequirements: [...template.requiredModules, ...template.requiredQuizzes],
          issuedAt: now,
          expiresAt,
          renewalNotificationSent: false,
          status: "active",
          certificateId: generateCertificateId(),
          verificationCode: generateVerificationCode(),
          issuedBy: "system_auto_award",
          complianceFramework: template.complianceFramework,
          creditsEarned: template.creditsAwarded,
          metadata: { specialNotes: "Automatically awarded upon meeting requirements" },
          createdAt: now,
          updatedAt: now,
        });
        
        awarded.push({
          certificateId: certId,
          title: template.title,
          category: template.category
        });
      }
    }
    
    return awarded;
  },
});

// Revoke certification
export const revokeCertification = mutation({
  args: {
    certificationId: v.id("certifications"),
    reason: v.string()
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    
    const existingCert = await ctx.db.get(args.certificationId);
    return await ctx.db.patch(args.certificationId, {
      status: "revoked",
      updatedAt: Date.now(),
      metadata: {
        ...existingCert?.metadata,
        specialNotes: `${existingCert?.metadata?.specialNotes || ''} REVOKED: ${args.reason}`.trim()
      }
    });
  },
});

// Renew certification
export const renewCertification = mutation({
  args: {
    certificationId: v.id("certifications"),
    validityPeriod: v.optional(v.number()) // in days
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    
    const cert = await ctx.db.get(args.certificationId);
    if (!cert) throw new Error("Certificate not found");
    
    const now = Date.now();
    const validityDays = args.validityPeriod || 365; // Default 1 year
    const newExpiryDate = now + (validityDays * 24 * 60 * 60 * 1000);
    
    return await ctx.db.patch(args.certificationId, {
      status: "active",
      expiresAt: newExpiryDate,
      renewalNotificationSent: false,
      updatedAt: now
    });
  },
});

// Get certification statistics (Admin only)
export const getCertificationStats = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    
    const certifications = await ctx.db.query("certifications").collect();
    const templates = await ctx.db.query("certificationTemplates").collect();
    
    const now = Date.now();
    const expiringSoon = certifications.filter(c => 
      c.expiresAt && c.expiresAt < now + (30 * 24 * 60 * 60 * 1000) && c.status === "active"
    );
    
    return {
      totalCertifications: certifications.length,
      activeCertifications: certifications.filter(c => c.status === "active").length,
      expiredCertifications: certifications.filter(c => c.status === "expired").length,
      revokedCertifications: certifications.filter(c => c.status === "revoked").length,
      expiringSoon: expiringSoon.length,
      certificateTemplates: templates.length,
      activeTemplates: templates.filter(t => t.isActive).length,
      autoAwardTemplates: templates.filter(t => t.autoAward).length
    };
  },
});

// Create certification template (Admin only)
export const createCertificationTemplate = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    certificateType: v.string(),
    requiredModules: v.array(v.id("trainingModules")),
    requiredQuizzes: v.array(v.id("quizzes")),
    minimumOverallScore: v.optional(v.number()),
    validityPeriod: v.optional(v.number()),
    complianceFramework: v.optional(v.array(v.string())),
    creditsAwarded: v.optional(v.number()),
    autoAward: v.boolean()
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    
    const identity = await ctx.auth.getUserIdentity();
    const now = Date.now();
    
    return await ctx.db.insert("certificationTemplates", {
      ...args,
      isActive: true,
      createdBy: identity?.subject || "unknown",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get all certification templates
export const getCertificationTemplates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("certificationTemplates")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get all certification templates (Admin view)
export const getAllCertificationTemplates = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    return await ctx.db.query("certificationTemplates").collect();
  },
});