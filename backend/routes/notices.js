import express from "express";

import {
  createNotice,
  getAllNotices,
} from "../controllers/noticeController.js";

const router = express.Router();

/**
 * Create Notice
 */
router.post("/", createNotice);

/**
 * Get All Notices
 */
router.get("/", getAllNotices);

export default router;