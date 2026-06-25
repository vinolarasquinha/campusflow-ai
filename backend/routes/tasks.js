import express from "express";

import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = express.Router();

/**
 * Create Task
 */
router.post("/", createTask);

/**
 * Get All Tasks
 */
router.get("/", getAllTasks);

/**
 * Get Single Task
 */
router.get("/:id", getTaskById);

/**
 * Update Task
 */
router.put("/:id", updateTask);

/**
 * Delete Task
 */
router.delete("/:id", deleteTask);

export default router;