import express from "express";
import {
  registerStudent,
  getAllStudents,
  getStudentById,
} from "../controllers/studentController.js";

const router = express.Router();

// Register student
router.post("/register", registerStudent);

// Get all students
router.get("/", getAllStudents);

// Get student by ID
router.get("/:id", getStudentById);

export default router;