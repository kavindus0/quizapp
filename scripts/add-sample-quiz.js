// Sample script to add a quiz directly to the database
// Run this in your browser console or create a mutation

const sampleQuiz = {
    title: "Cybersecurity Fundamentals Quiz",
    questions: [
        {
            questionText: "What is the primary purpose of a firewall?",
            options: [
                "To speed up internet connection",
                "To block unauthorized network access",
                "To store passwords securely",
                "To encrypt email messages"
            ],
            correctAnswerIndex: 1
        },
        {
            questionText: "Which of the following is considered a strong password?",
            options: [
                "password123",
                "MyP@ssw0rd2024!",
                "admin",
                "123456789"
            ],
            correctAnswerIndex: 1
        },
        {
            questionText: "What should you do if you receive a suspicious email?",
            options: [
                "Click all links to investigate",
                "Forward it to all colleagues",
                "Report it to IT security team",
                "Reply asking for more information"
            ],
            correctAnswerIndex: 2
        },
        {
            questionText: "How often should you update your software?",
            options: [
                "Once a year",
                "Only when it stops working",
                "When security updates are available",
                "Never, it might break something"
            ],
            correctAnswerIndex: 2
        }
    ]
};

console.log("Sample Quiz Data:", JSON.stringify(sampleQuiz, null, 2));