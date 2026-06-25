import {
  getAutomationLogs,
} from "../services/automationLogService.js";

export const fetchAutomationLogs =
  async (req, res) => {
    try {
      const logs =
        await getAutomationLogs();

      return res.status(200).json({
        success: true,
        count: logs.length,
        logs,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch automation logs",
        error: error.message,
      });
    }
  };