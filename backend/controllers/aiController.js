import {
  generateStudyPlan,
  summarizeNotice,
  generateFlashcards,
  generateMCQs,
  analyzeAttendance,
} from "../services/geminiService.js";

/**
 * POST /api/ai/study-plan
 */
export const getStudyPlan = async (req, res) => {
  try {
    const { subject, deadline, taskTitle } = req.body;

    if (!subject || !deadline || !taskTitle) {
      return res.status(400).json({
        success: false,
        message: "subject, deadline and taskTitle are required",
      });
    }

    const plan = await generateStudyPlan(
      subject,
      deadline,
      taskTitle
    );

    return res.status(200).json({
      success: true,
      studyPlan: plan,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate study plan",
      error: error.message,
    });
  }
};

/**
 * POST /api/ai/summarize
 */
export const getNoticeSummary = async (req, res) => {
  try {
    const { noticeText } = req.body;

    if (!noticeText) {
      return res.status(400).json({
        success: false,
        message: "noticeText is required",
      });
    }

    const summary = await summarizeNotice(
      noticeText
    );

    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to summarize notice",
      error: error.message,
    });
  }
};

/**
 * POST /api/ai/flashcards
 */
export const getFlashcards = async (req, res) => {
  try {
    const { notesContent } = req.body;

    if (!notesContent) {
      return res.status(400).json({
        success: false,
        message: "notesContent is required",
      });
    }

    const flashcards = await generateFlashcards(
      notesContent
    );

    return res.status(200).json({
      success: true,
      flashcards,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate flashcards",
      error: error.message,
    });
  }
};

/**
 * POST /api/ai/mcqs
 */
export const getMCQs = async (req, res) => {
  try {
    const { notesContent } = req.body;

    if (!notesContent) {
      return res.status(400).json({
        success: false,
        message: "notesContent is required",
      });
    }

    const mcqs = await generateMCQs(
      notesContent
    );

    return res.status(200).json({
      success: true,
      mcqs,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate MCQs",
      error: error.message,
    });
  }
};

/**
 * POST /api/ai/attendance
 */
export const getAttendanceAnalysis =
  async (req, res) => {
    try {
      const {
        subject,
        attendancePercentage,
      } = req.body;

      if (
        !subject ||
        attendancePercentage === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "subject and attendancePercentage are required",
        });
      }

      const analysis =
        await analyzeAttendance(
          subject,
          attendancePercentage
        );

      return res.status(200).json({
        success: true,
        analysis,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to analyze attendance",
        error: error.message,
      });
    }
  };