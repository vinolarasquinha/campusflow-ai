import supabase from "../config/supabase.js";
import { triggerDeadlineWorkflow } from "../services/n8nService.js";

/**
 * POST /api/tasks
 * Create Task
 */
export const createTask = async (req, res) => {
  try {
    const {
      student_id,
      title,
      subject,
      description,
      deadline,
      reminder_time,
      add_to_calendar,
      whatsapp_reminder,
      ai_study_plan,
      priority,
    } = req.body;

    if (!student_id || !title || !deadline) {
      return res.status(400).json({
        success: false,
        message: "student_id, title and deadline are required",
      });
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          student_id,
          title,
          subject,
          description,
          deadline,
          reminder_time,
          add_to_calendar,
          whatsapp_reminder,
          ai_study_plan,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Fetch student details to pass phone and email to n8n webhook
    const { data: student } = await supabase
      .from("students")
      .select("name, phone, google_email")
      .eq("id", student_id)
      .maybeSingle();

    const formattedPhone = student?.phone
      ? (student.phone.startsWith("+") ? student.phone : `+91${student.phone}`)
      : null;

    await triggerDeadlineWorkflow({
      taskTitle: title,
      subject,
      deadline,
      studentId: student_id,
      reminderTime: reminder_time,
      add_to_calendar: !!add_to_calendar,
      whatsapp_reminder: !!whatsapp_reminder,
      ai_study_plan: !!ai_study_plan,
      phone: formattedPhone ? `whatsapp:${formattedPhone}` : null,
      google_email: student?.google_email || null,
      studentName: student?.name || null,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: { ...data, priority: priority || "medium" },
    });
  } catch (error) {
    console.error("Create Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};

/**
 * GET /api/tasks
 * Get All Tasks
 */
export const getAllTasks = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("deadline", { ascending: true });

    if (error) throw error;

    const tasksWithPriority = data.map(task => ({
      ...task,
      priority: "medium"
    }));

    return res.status(200).json({
      success: true,
      count: tasksWithPriority.length,
      tasks: tasksWithPriority,
    });
  } catch (error) {
    console.error("Get Tasks Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};

/**
 * GET /api/tasks/:id
 * Get Single Task
 */
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      task: { ...data, priority: "medium" },
    });
  } catch (error) {
    console.error("Get Task Error:", error);

    return res.status(404).json({
      success: false,
      message: "Task not found",
      error: error.message,
    });
  }
};

/**
 * PUT /api/tasks/:id
 * Update Task
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = { ...req.body };
    const priority = updateData.priority;
    delete updateData.priority;

    const { data, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: { ...data, priority: priority || "medium" },
    });
  } catch (error) {
    console.error("Update Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/tasks/:id
 * Delete Task
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    });
  }
};