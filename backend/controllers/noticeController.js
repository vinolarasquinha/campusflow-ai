import supabase from "../config/supabase.js";

import { summarizeNotice } from "../services/geminiService.js";

import {
  triggerNoticeWorkflow,
} from "../services/n8nService.js";

import {
  createAutomationLog,
} from "../services/automationLogService.js";

/**
 * Create Notice
 */
export const createNotice = async (req, res) => {
  try {
    const {
      title,
      notice_text,
      event_date,
    } = req.body;

    if (!title || !notice_text) {
      return res.status(400).json({
        success: false,
        message: "title and notice_text are required",
      });
    }

    // Generate AI Summary
    const summary = await summarizeNotice(notice_text);

    // Save Notice
    const { data, error } = await supabase
      .from("notices")
      .insert([
        {
          title,
          notice_text,
          summary,
          event_date,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Fetch all registered students
    const { data: students, error: studentError } =
      await supabase
        .from("students")
        .select("name, phone");

    if (studentError) throw studentError;

    // Convert to WhatsApp numbers
    const phoneList = students
      .filter((student) => student.phone)
      .map((student) => {
        const phone = student.phone.startsWith("+")
          ? student.phone
          : `+91${student.phone}`;

        return `whatsapp:${phone}`;
      });

    // Trigger n8n
    await triggerNoticeWorkflow({
      eventTitle: title,
      noticeText: notice_text,
      eventDate: event_date,
      aiSummary: summary,
      phoneList,
    });

    return res.status(201).json({
      success: true,
      message: "Notice created successfully",
      totalRecipients: phoneList.length,
      notice: data,
    });

  } catch (error) {
    console.error("Create Notice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create notice",
      error: error.message,
    });
  }
};

/**
 * Get All Notices
 */
export const getAllNotices =
  async (req, res) => {
    try {
      const { data, error } =
        await supabase
          .from("notices")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        notices: data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };