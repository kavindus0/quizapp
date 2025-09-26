import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, getCurrentUser } from "./rbac";

// List all quizzes (public query)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("quizzes").collect();
  },
});

// Get a single quiz (public query) - excludes correct answers for security
export const get = query({
  args: { id: v.id("quizzes") },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.id);
    if (!quiz) return null;

    // Return quiz without correct answers for security
    return {
      _id: quiz._id,
      _creationTime: quiz._creationTime,
      title: quiz.title,
      questions: quiz.questions.map(q => ({
        questionText: q.questionText,
        options: q.options,
        // Exclude correctAnswerIndex for security
      })),
    };
  },
});

// Get a quiz with answers (Admin only - for editing)
export const getWithAnswers = query({
  args: { id: v.id("quizzes") },
  handler: async (ctx, args) => {
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);

    return await ctx.db.get(args.id);
  },
});

// Create a new quiz (Admin only)
export const create = mutation({
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
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);

    return await ctx.db.insert("quizzes", args);
  },
});

// Update a quiz (Admin only)
export const update = mutation({
  args: {
    id: v.id("quizzes"),
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
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);

    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Delete a quiz (Admin only)
export const remove = mutation({
  args: { id: v.id("quizzes") },
  handler: async (ctx, args) => {
    // Check if user has admin role
    await requireRole(ctx, ["admin"]);

    return await ctx.db.delete(args.id);
  },
});

// Create dummy security awareness quiz data
export const createDummyQuiz = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if dummy quiz already exists
    const existingQuiz = await ctx.db
      .query("quizzes")
      .filter((q) => q.eq(q.field("title"), "Security Awareness Training - Module 1"))
      .first();

    if (existingQuiz) {
      return existingQuiz._id;
    }

    // Create comprehensive security awareness quiz
    const quizId = await ctx.db.insert("quizzes", {
      title: "Security Awareness Training - Module 1",
      questions: [
        {
          questionText: "What should you do if you receive a suspicious email asking for your password?",
          options: [
            "Reply with your password immediately",
            "Forward it to all your colleagues", 
            "Delete the email and report it to IT security",
            "Click all links to verify authenticity"
          ],
          correctAnswerIndex: 2
        },
        {
          questionText: "Which of the following is considered a strong password?",
          options: [
            "password123",
            "MyN@me123",
            "Tr0ub4dor&3", 
            "12345678"
          ],
          correctAnswerIndex: 2
        },
        {
          questionText: "What is phishing?",
          options: [
            "A type of computer virus",
            "A method to catch actual fish",
            "An attempt to steal sensitive information through deceptive emails or websites",
            "A programming language"
          ],
          correctAnswerIndex: 2
        },
        {
          questionText: "How often should you update your software and operating system?",
          options: [
            "Never, updates can break things",
            "Once a year", 
            "Only when you buy a new computer",
            "Regularly, as updates become available"
          ],
          correctAnswerIndex: 3
        },
        {
          questionText: "What should you do before connecting to public Wi-Fi?",
          options: [
            "Nothing special, all Wi-Fi is safe",
            "Verify the network name and use a VPN if possible",
            "Share your personal information immediately",
            "Download suspicious software"
          ],
          correctAnswerIndex: 1
        },
        {
          questionText: "What is two-factor authentication (2FA)?",
          options: [
            "Using two different passwords",
            "Having two computers",
            "An additional security layer requiring a second form of verification",
            "A type of malware"
          ],
          correctAnswerIndex: 2
        },
        {
          questionText: "If you see a USB drive in the parking lot, what should you do?",
          options: [
            "Pick it up and plug it into your work computer to find the owner",
            "Leave it alone and report it to security",
            "Take it home for personal use",
            "Share it with colleagues to see what's on it"
          ],
          correctAnswerIndex: 1
        },
        {
          questionText: "What is social engineering?",
          options: [
            "Building social media applications",
            "Manipulating people to divulge confidential information",
            "Engineering for social causes",
            "A type of social network"
          ],
          correctAnswerIndex: 1
        }
      ],
    });

    return quizId;
  },
});

// Submit quiz answers and calculate score (Any authenticated user)
export const submitQuiz = mutation({
  args: {
    quizId: v.id("quizzes"),
    answers: v.array(v.number()), // Array of selected answer indices
    timeSpent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the quiz to check answers
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) {
      throw new Error("Quiz not found");
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question, index) => {
      if (args.answers[index] === question.correctAnswerIndex) {
        correctAnswers++;
      }
    });

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Save the detailed quiz result
    const resultId = await ctx.db.insert("quizResults", {
      userId: identity.subject, // Clerk user ID
      quizId: args.quizId,
      answers: args.answers,
      score: correctAnswers,
      totalQuestions,
      percentage,
      completedAt: Date.now(),
      timeSpent: args.timeSpent,
    });

    // Find associated training module (if any) and update progress
    const associatedModule = await ctx.db
      .query("trainingModules")
      .filter((q) => q.eq(q.field("quizId"), args.quizId))
      .first();

    // Update module progress if quiz is associated with a module
    const passed = percentage >= 70;
    if (associatedModule) {
      try {
        // Find the user in our database
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
          .first();

        if (user) {
          // Update or create progress record with real-time tracking
          const existingProgress = await ctx.db
            .query("userProgress")
            .withIndex("by_user_and_module", (q) =>
              q.eq("userId", user._id).eq("moduleId", associatedModule._id)
            )
            .first();

          const now = Date.now();
          const progressData = {
            quizScore: percentage,
            lastAccessedAt: now,
            timeSpent: args.timeSpent,
            completionMethod: passed ? "quiz_passed" : "quiz_attempted",
            ...(passed && { completedAt: now })
          };

          if (existingProgress) {
            await ctx.db.patch(existingProgress._id, progressData);
          } else {
            await ctx.db.insert("userProgress", {
              userId: user._id,
              moduleId: associatedModule._id,
              quizScore: percentage,
              lastAccessedAt: now,
              timeSpent: args.timeSpent,
              completionMethod: passed ? "quiz_passed" : "quiz_attempted",
              completedAt: passed ? now : 0
            });
          }
        }
      } catch (error) {
        console.log("Progress update failed:", error);
      }
    }

    return {
      resultId,
      score: correctAnswers,
      totalQuestions,
      percentage,
      passed: percentage >= 70, // 70% passing grade
    };
  },
});

// Get quiz results for current user
export const getMyQuizResults = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const results = await ctx.db
      .query("quizResults")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    // Fetch quiz details for each result
    const resultsWithQuizDetails = await Promise.all(
      results.map(async (result) => {
        const quiz = await ctx.db.get(result.quizId);
        return {
          ...result,
          quizTitle: quiz?.title || "Unknown Quiz",
        };
      })
    );

    return resultsWithQuizDetails;
  },
});

// Get detailed quiz result with question analysis
export const getQuizResultDetails = query({
  args: { resultId: v.id("quizResults") },
  handler: async (ctx, { resultId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const result = await ctx.db.get(resultId);
    if (!result) {
      throw new Error("Quiz result not found");
    }

    // Verify the result belongs to the current user
    if (result.userId !== identity.subject) {
      throw new Error("Unauthorized to view this result");
    }

    const quiz = await ctx.db.get(result.quizId);
    if (!quiz) {
      throw new Error("Quiz not found");
    }

    // Build detailed result with question analysis
    const questionAnalysis = quiz.questions.map((question, index) => {
      const userAnswer = result.answers[index];
      const isCorrect = userAnswer === question.correctAnswerIndex;

      return {
        questionNumber: index + 1,
        questionText: question.questionText,
        options: question.options,
        userAnswer,
        correctAnswer: question.correctAnswerIndex,
        isCorrect,
        userAnswerText: question.options[userAnswer] || "No answer",
        correctAnswerText: question.options[question.correctAnswerIndex],
      };
    });

    return {
      ...result,
      quiz: {
        title: quiz.title,
      },
      questionAnalysis,
    };
  },
});