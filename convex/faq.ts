import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// FAQ Schema validation
const faqSchema = v.object({
  question: v.string(),
  answer: v.string(),
  category: v.string(),
  tags: v.array(v.string()),
  isActive: v.boolean(),
  order: v.number(),
  helpful: v.number(),
});

// Get all active FAQs
export const getAllFAQs = query({
  handler: async (ctx) => {
    const faqs = await ctx.db
      .query("faqs")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();

    // Sort by helpful count descending, then by order ascending
    return faqs.sort((a, b) => {
      if (b.helpful !== a.helpful) {
        return b.helpful - a.helpful;
      }
      return a.order - b.order;
    });
  },
});

// Get FAQs by category
export const getFAQsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    if (args.category === "all") {
      return await ctx.db
        .query("faqs")
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }

    return await ctx.db
      .query("faqs")
      .filter((q) => 
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("category"), args.category)
        )
      )
      .collect();
  },
});

// Search FAQs
export const searchFAQs = query({
  args: { 
    searchTerm: v.string(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    const allFAQs = await ctx.db
      .query("faqs")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const searchLower = args.searchTerm.toLowerCase();

    return allFAQs.filter(faq => {
      // Search in question and answer
      const matchesSearch = !args.searchTerm || 
        faq.question.toLowerCase().includes(searchLower) ||
        faq.answer.toLowerCase().includes(searchLower) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchLower));

      // Filter by category
      const matchesCategory = !args.category || 
        args.category === "all" || 
        faq.category === args.category;

      // Filter by tags
      const matchesTags = !args.tags || 
        args.tags.length === 0 || 
        args.tags.some(tag => faq.tags.includes(tag));

      return matchesSearch && matchesCategory && matchesTags;
    }).sort((a, b) => {
      // Sort by relevance (helpful count), then by order
      if (b.helpful !== a.helpful) {
        return b.helpful - a.helpful;
      }
      return a.order - b.order;
    });
  },
});

// Mark FAQ as helpful
export const markFAQHelpful = mutation({
  args: { faqId: v.id("faqs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const faq = await ctx.db.get(args.faqId);
    if (!faq) {
      throw new Error("FAQ not found");
    }

    // Check if user has already marked this FAQ as helpful
    const existingFeedback = await ctx.db
      .query("faqFeedback")
      .filter((q) => 
        q.and(
          q.eq(q.field("faqId"), args.faqId),
          q.eq(q.field("userId"), identity.subject)
        )
      )
      .first();

    if (existingFeedback) {
      throw new Error("You have already provided feedback for this FAQ");
    }

    // Add feedback record
    await ctx.db.insert("faqFeedback", {
      faqId: args.faqId,
      userId: identity.subject,
      helpful: true,
      createdAt: Date.now()
    });

    // Update helpful count
    await ctx.db.patch(args.faqId, {
      helpful: faq.helpful + 1
    });

    return { success: true };
  },
});

// Admin: Create new FAQ
export const createFAQ = mutation({
  args: faqSchema,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized - Admin access required");
    }

    return await ctx.db.insert("faqs", {
      ...args,
      createdBy: identity.subject,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Admin: Update FAQ
export const updateFAQ = mutation({
  args: { 
    faqId: v.id("faqs"),
    updates: faqSchema
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized - Admin access required");
    }

    const faq = await ctx.db.get(args.faqId);
    if (!faq) {
      throw new Error("FAQ not found");
    }

    return await ctx.db.patch(args.faqId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

// Admin: Delete FAQ (soft delete by setting isActive to false)
export const deleteFAQ = mutation({
  args: { faqId: v.id("faqs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized - Admin access required");
    }

    const faq = await ctx.db.get(args.faqId);
    if (!faq) {
      throw new Error("FAQ not found");
    }

    return await ctx.db.patch(args.faqId, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

// Get FAQ statistics for admin dashboard
export const getFAQStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized - Admin access required");
    }

    const allFAQs = await ctx.db.query("faqs").collect();
    const activeFAQs = allFAQs.filter(faq => faq.isActive);
    
    // Get feedback counts
    const allFeedback = await ctx.db.query("faqFeedback").collect();
    const helpfulFeedback = allFeedback.filter(f => f.helpful);

    // Category breakdown
    const categoryStats = activeFAQs.reduce((acc, faq) => {
      acc[faq.category] = (acc[faq.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Most helpful FAQs
    const mostHelpful = activeFAQs
      .sort((a, b) => b.helpful - a.helpful)
      .slice(0, 10)
      .map(faq => ({
        id: faq._id,
        question: faq.question,
        helpful: faq.helpful,
        category: faq.category
      }));

    // Recent feedback
    const recentFeedback = allFeedback
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20);

    return {
      totalFAQs: activeFAQs.length,
      totalFeedback: allFeedback.length,
      helpfulFeedback: helpfulFeedback.length,
      averageHelpfulness: allFeedback.length > 0 ? 
        (helpfulFeedback.length / allFeedback.length * 100).toFixed(1) : 0,
      categoryBreakdown: categoryStats,
      mostHelpfulFAQs: mostHelpful,
      recentFeedback: recentFeedback
    };
  },
});

// Get popular tags
export const getPopularTags = query({
  handler: async (ctx) => {
    const faqs = await ctx.db
      .query("faqs")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const tagCount = faqs.reduce((acc, faq) => {
      faq.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));
  },
});