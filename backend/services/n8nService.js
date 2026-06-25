import axios from "axios";
import { createAutomationLog } from "./automationLogService.js";

/**
 * Deadline Workflow
 */
export const triggerDeadlineWorkflow = async (payload) => {
  try {
    if (!process.env.N8N_DEADLINE_WEBHOOK) {
      await createAutomationLog({
        workflow_name: "Deadline Workflow",
        status: "CONFIG_MISSING",
        details: "N8N_DEADLINE_WEBHOOK not configured",
      });

      return;
    }

    const response = await axios.post(
      process.env.N8N_DEADLINE_WEBHOOK,
      payload
    );

    await createAutomationLog({
      workflow_name: "Deadline Workflow",
      status: "SUCCESS",
      details: JSON.stringify(payload),
    });

    return response.data;
  } catch (error) {
    await createAutomationLog({
      workflow_name: "Deadline Workflow",
      status: "FAILED",
      details:
        error?.response?.data?.message ||
        error.message,
    });

    console.error(
      "Deadline Workflow Error:",
      error.message
    );
  }
};

/**
 * Notice Workflow
 */
export const triggerNoticeWorkflow = async (payload) => {
  try {
    if (!process.env.N8N_NOTICE_WEBHOOK) {
      await createAutomationLog({
        workflow_name: "Notice Workflow",
        status: "CONFIG_MISSING",
        details: "N8N_NOTICE_WEBHOOK not configured",
      });

      return;
    }

    const response = await axios.post(
      process.env.N8N_NOTICE_WEBHOOK,
      payload
    );

    await createAutomationLog({
      workflow_name: "Notice Workflow",
      status: "SUCCESS",
      details: JSON.stringify(payload),
    });

    return response.data;
  } catch (error) {
    await createAutomationLog({
      workflow_name: "Notice Workflow",
      status: "FAILED",
      details:
        error?.response?.data?.message ||
        error.message,
    });

    console.error(
      "Notice Workflow Error:",
      error.message
    );
  }
};

/**
 * Quiz Workflow
 */
export const triggerQuizWorkflow = async (payload) => {
  try {
    if (!process.env.N8N_QUIZ_WEBHOOK) {
      await createAutomationLog({
        workflow_name: "Quiz Workflow",
        status: "CONFIG_MISSING",
        details: "N8N_QUIZ_WEBHOOK not configured",
      });

      return;
    }

    const response = await axios.post(
      process.env.N8N_QUIZ_WEBHOOK,
      payload
    );

    await createAutomationLog({
      workflow_name: "Quiz Workflow",
      status: "SUCCESS",
      details: JSON.stringify(payload),
    });

    return response.data;
  } catch (error) {
    await createAutomationLog({
      workflow_name: "Quiz Workflow",
      status: "FAILED",
      details:
        error?.response?.data?.message ||
        error.message,
    });

    console.error(
      "Quiz Workflow Error:",
      error.message
    );
  }
};

/**
 * Attendance Workflow
 */
export const triggerAttendanceWorkflow = async (
  payload
) => {
  try {
    if (!process.env.N8N_ATTENDANCE_WEBHOOK) {
      await createAutomationLog({
        workflow_name: "Attendance Workflow",
        status: "CONFIG_MISSING",
        details:
          "N8N_ATTENDANCE_WEBHOOK not configured",
      });

      return;
    }

    const response = await axios.post(
      process.env.N8N_ATTENDANCE_WEBHOOK,
      payload
    );

    await createAutomationLog({
      workflow_name: "Attendance Workflow",
      status: "SUCCESS",
      details: JSON.stringify(payload),
    });

    return response.data;
  } catch (error) {
    await createAutomationLog({
      workflow_name: "Attendance Workflow",
      status: "FAILED",
      details:
        error?.response?.data?.message ||
        error.message,
    });

    console.error(
      "Attendance Workflow Error:",
      error.message
    );
  }
};