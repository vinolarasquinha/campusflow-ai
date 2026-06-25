import { model } from "../config/gemini.js";

/**
 * Generate Study Plan
 */
export const generateStudyPlan = async (
  subject,
  deadline,
  taskTitle
) => {
  try {
    const prompt = `
You are an expert academic planner.

Task:
${taskTitle}

Subject:
${subject}

Deadline:
${deadline}

Generate a day-wise study plan.

Rules:
- Be concise
- Return only bullet points
- Focus on helping a B.Tech student complete the task

Example:

Day 1:
- Read Unit 1

Day 2:
- Solve previous questions

Day 3:
- Complete assignment
`;

    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.error("Study Plan Error:", error);
    throw error;
  }
};

/**
 * Notice Summarizer
 */
export const summarizeNotice = async (noticeText) => {
  try {
    const prompt = `
Summarize the following college notice.

Requirements:
- Exactly 3 bullet points
- Short and student-friendly
- Highlight important dates

Notice:

${noticeText}
`;

    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.error("Notice Summary Error:", error);
    throw error;
  }
};

/**
 * Flashcards Generator
 */
export const generateFlashcards = async (
  notesContent
) => {
  try {
    const prompt = `
Generate 5 flashcards from the following notes.

Return format:

Q: Question
A: Answer

Notes:

${notesContent}
`;

    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.error("Flashcard Error:", error);
    throw error;
  }
};

/**
 * MCQ Generator
 */
export const generateMCQs = async (
  notesContent
) => {
  try {
    const prompt = `
Generate 5 MCQs from these notes.

Format:

Question
A)
B)
C)
D)

Correct Answer:

Notes:

${notesContent}
`;

    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.error("MCQ Error:", error);
    throw error;
  }
};

/**
 * Attendance Risk Analysis
 */
export const analyzeAttendance = async (
  subject,
  attendancePercentage
) => {
  try {
    const prompt = `
You are an academic advisor.

Subject:
${subject}

Attendance:
${attendancePercentage}%

Required Attendance:
75%

Calculate:

1. Risk Level
2. Approximate classes needed
3. Advice

Keep response short.
`;

    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.error("Attendance Analysis Error:", error);
    throw error;
  }
};