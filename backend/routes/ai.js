import express from "express";

import {
  getStudyPlan,
  getNoticeSummary,
  getFlashcards,
  getMCQs,
  getAttendanceAnalysis,
} from "../controllers/aiController.js";

const router = express.Router();

/**
 * Smart Deadline Manager
 */
router.post("/study-plan", getStudyPlan);

/**
 * Notice Summarizer
 */
router.post("/summarize", getNoticeSummary);

/**
 * AI Study Buddy
 */
router.post("/flashcards", getFlashcards);
router.post("/mcqs", getMCQs);

/**
 * Attendance Risk Alerter
 */
router.post("/attendance", getAttendanceAnalysis);

export default router;