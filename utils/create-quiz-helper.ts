import { api } from "@/convex/_generated/api";

// Example: Adding a quiz programmatically
// You can use this in your admin components or scripts

export async function createSampleQuiz(convex: any) {
  try {
    const quizId = await convex.mutation(api.quizzes.create, {
      title: "Data Protection & Privacy Quiz",
      questions: [
        {
          questionText: "What does GDPR stand for?",
          options: [
            "General Data Protection Regulation",
            "Global Data Privacy Rules", 
            "Government Data Protection Rights",
            "Generic Data Processing Requirements"
          ],
          correctAnswerIndex: 0
        },
        {
          questionText: "Personal data should be:",
          options: [
            "Shared with everyone",
            "Processed lawfully and transparently",
            "Stored indefinitely",
            "Accessible to all employees"
          ],
          correctAnswerIndex: 1
        },
        {
          questionText: "If you suspect a data breach, you should:",
          options: [
            "Wait to see if it gets worse",
            "Try to fix it yourself first",
            "Report it immediately to the data protection officer",
            "Ignore it if no one noticed"
          ],
          correctAnswerIndex: 2
        }
      ]
    });
    
    console.log("Quiz created successfully with ID:", quizId);
    return quizId;
  } catch (error) {
    console.error("Failed to create quiz:", error);
    throw error;
  }
}