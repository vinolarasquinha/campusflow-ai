import express from "express";
import { fetchAutomationLogs } from "../controllers/automationController.js";

const router = express.Router();

router.get("/", fetchAutomationLogs);

export default router;