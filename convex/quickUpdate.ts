import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Quick function to mark training modules as required
export const markModuleAsRequired = mutation({
  args: {
    moduleId: v.id("trainingModules"),
    isRequired: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.moduleId, {
      isRequired: args.isRequired,
      updatedAt: Date.now(),
    });
    
    const module = await ctx.db.get(args.moduleId);
    return {
      success: true,
      moduleId: args.moduleId,
      title: (module as any)?.title || "Unknown",
      isRequired: args.isRequired,
    };
  },
});

// Bulk update key modules to be required
export const markKeyModulesAsRequired = mutation({
  args: {},
  handler: async (ctx) => {
    const keyModuleIds = [
      "jx77tgbjkmxr745h884yzxcdj17rbmcq", // Information Security Awareness Employee Training
      "jx73qkywqgj5yjh86rtaz8e20h7rbm6m", // Introduction To Cyber Security
      "jx76cfpxsh7w337wv136v35a917rb9sa", // What Is a Phishing Attack
      "jx725h06qvkyz3cd4pkkv3bxnd7ra4fj", // What is Social Engineering
      "jx7eq7z3ewqfqw86mrgeaz26097rab7e", // Password Peril
      "jx725bbt0m268p7kvqqxrzjqd57rb81w", // Cyber Security Awareness
    ];

    const results = [];
    
    for (const moduleId of keyModuleIds) {
      try {
        await ctx.db.patch(moduleId as any, {
          isRequired: true,
          updatedAt: Date.now(),
        });
        
        const module = await ctx.db.get(moduleId as any);
        results.push({
          success: true,
          moduleId,
          title: (module as any)?.title || "Unknown",
        });
      } catch (error) {
        results.push({
          success: false,
          moduleId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      totalUpdated: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
      results,
    };
  },
});