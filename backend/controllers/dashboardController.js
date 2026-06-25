import supabase from "../config/supabase.js";

export const getDashboard = async (req, res) => {
  try {
    const { student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: "student_id is required",
      });
    }

    // Student
    const { data: student } = await supabase
      .from("students")
      .select("*")
      .eq("id", student_id)
      .single();

    // Tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("student_id", student_id);

    // Notices
    const { data: notices } = await supabase
      .from("notices")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    const pendingTasks =
      tasks?.filter((task) => task.status === "pending") || [];

    const completedTasks =
      tasks?.filter((task) => task.status === "completed") || [];

    const upcomingDeadlines =
      tasks
        ?.filter((task) => new Date(task.deadline) > new Date())
        ?.sort(
          (a, b) =>
            new Date(a.deadline) - new Date(b.deadline)
        )
        ?.slice(0, 5) || [];

    return res.status(200).json({
      success: true,

      dashboard: {
        student,

        stats: {
          totalTasks: tasks?.length || 0,
          pendingTasks: pendingTasks.length,
          completedTasks: completedTasks.length,
        },

        upcomingDeadlines,

        recentNotices: notices || [],

        aiTip:
          "Study 25 minutes, take 5 minutes break. Consistency beats intensity.",
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
      error: error.message,
    });
  }
};