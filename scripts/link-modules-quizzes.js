// Simple script to manually link training modules with quizzes
// Run with: node scripts/link-modules-quizzes.js

const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

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
    }
];

async function linkModulesWithQuizzes() {
    try {
        console.log("Fetching training modules...");
        const modules = await client.query("training.list");

        console.log("Fetching quizzes...");
        const quizzes = await client.query("quizzes.list");

        console.log("Starting linking process...");

        for (const mapping of mappings) {
            const module = modules.find(m => m.title === mapping.moduleTitle);
            const quiz = quizzes.find(q => q.title === mapping.quizTitle);

            if (module && quiz) {
                console.log(`Linking "${module.title}" with "${quiz.title}"`);

                try {
                    await client.mutation("training.update", {
                        id: module._id,
                        quizId: quiz._id,
                        title: module.title,
                        description: module.description,
                        type: module.type
                    });
                    console.log(`✓ Successfully linked ${module.title}`);
                } catch (error) {
                    console.log(`✗ Failed to link ${module.title}:`, error.message);
                }
            } else {
                console.log(`✗ Could not find module "${mapping.moduleTitle}" or quiz "${mapping.quizTitle}"`);
            }
        }

        console.log("Linking process completed!");

    } catch (error) {
        console.error("Error:", error);
    }
}

linkModulesWithQuizzes();