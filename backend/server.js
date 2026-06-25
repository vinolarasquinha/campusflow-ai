import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import supabase from "./config/supabase.js";

import studentRoutes from "./routes/students.js";
import taskRoutes from "./routes/tasks.js";
import aiRoutes from "./routes/ai.js";
import noticeRoutes from "./routes/notices.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import automationRoutes from "./routes/automationRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CampusFlow API Running 🚀",
  });
});

// Supabase Connection Test
app.get("/test-supabase", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*");

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/automation-logs", automationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});