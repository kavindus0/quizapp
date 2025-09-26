import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Link training modules with their corresponding quizzes
export const linkModuleWithQuiz = mutation({
  args: {
    moduleTitle: v.string(),
    quizTitle: v.string()
  },
  handler: async (ctx, args) => {
    // Find the module by title
    const module = await ctx.db
      .query("trainingModules")
      .filter(q => q.eq(q.field("title"), args.moduleTitle))
      .first();

    if (!module) {
      throw new Error(`Module not found: ${args.moduleTitle}`);
    }

    // Find the quiz by title
    const quiz = await ctx.db
      .query("quizzes")
      .filter(q => q.eq(q.field("title"), args.quizTitle))
      .first();

    if (!quiz) {
      throw new Error(`Quiz not found: ${args.quizTitle}`);
    }

    // Update the module to link with the quiz
    await ctx.db.patch(module._id, {
      quizId: quiz._id
    });

    return {
      moduleId: module._id,
      quizId: quiz._id,
      message: `Successfully linked "${args.moduleTitle}" with "${args.quizTitle}"`
    };
  }
});

// Bulk link modules with quizzes based on topic matching
export const bulkLinkModulesWithQuizzes = mutation({
  args: {},
  handler: async (ctx) => {
    // Define module-quiz mappings based on topics
    const mappings = [
      {
        moduleTitle: "Information Security Awareness Employee Training",
        quizTitle: "Information Security Awareness Assessment"
      },
      {
        moduleTitle: "Introduction To Cyber Security",
        quizTitle: "Cyber Security Fundamentals Quiz"
      },
      {
        moduleTitle: "What is Social Engineering",
        quizTitle: "Social Engineering Awareness Quiz"
      },
      {
        moduleTitle: "Password Peril",
        quizTitle: "Password Security and Management Quiz"
      },
      {
        moduleTitle: "What Is a Phishing Attack",
        quizTitle: "Phishing Identification and Prevention Quiz"
      },
      {
        moduleTitle: "Cyber Security Awareness",
        quizTitle: "Data Protection and Privacy Quiz"
      },
      {
        moduleTitle: "The Insider Threat",
        quizTitle: "Incident Response Procedures Quiz"
      },
      {
        moduleTitle: "What is ISO/IEC 27001",
        quizTitle: "Compliance and Regulatory Requirements Quiz"
      },
      {
        moduleTitle: "How to Identify and Avoid Risks",
        quizTitle: "Secure Remote Work Practices Quiz"
      },
      {
        moduleTitle: "Role-based Access Control (RBAC) vs. Attribute-based Access Control (ABAC)",
        quizTitle: "Mobile Device Security Quiz"
      }
    ];

    const results = [];

    for (const mapping of mappings) {
      try {
        // Find the module by title
        const module = await ctx.db
          .query("trainingModules")
          .filter(q => q.eq(q.field("title"), mapping.moduleTitle))
          .first();

        // Find the quiz by title
        const quiz = await ctx.db
          .query("quizzes")
          .filter(q => q.eq(q.field("title"), mapping.quizTitle))
          .first();

        if (module && quiz) {
          // Update the module to link with the quiz
          await ctx.db.patch(module._id, {
            quizId: quiz._id
          });

          results.push({
            success: true,
            moduleTitle: mapping.moduleTitle,
            quizTitle: mapping.quizTitle,
            moduleId: module._id,
            quizId: quiz._id
          });
        } else {
          results.push({
            success: false,
            moduleTitle: mapping.moduleTitle,
            quizTitle: mapping.quizTitle,
            error: `${!module ? 'Module' : 'Quiz'} not found`
          });
        }
      } catch (error) {
        results.push({
          success: false,
          moduleTitle: mapping.moduleTitle,
          quizTitle: mapping.quizTitle,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return {
      totalMappings: mappings.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }
});