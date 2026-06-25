import supabase from "./config/supabase.js";

async function checkLogs() {
  try {
    const { data, error } = await supabase
      .from("automation_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    console.log("LAST LOG STATUS:", data.status);
    console.log("DETAILS:\n", data.details);
  } catch (err) {
    console.error("Error reading logs:", err.message);
  }
}

checkLogs();
