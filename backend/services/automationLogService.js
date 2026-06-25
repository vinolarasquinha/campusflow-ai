import supabase from "../config/supabase.js";

export const createAutomationLog = async ({
  workflow_name,
  status,
  details,
}) => {
  try {
    const { data, error } = await supabase
      .from("automation_logs")
      .insert([
        {
          workflow_name,
          status,
          details,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(
      "Automation Log Error:",
      error.message
    );
    return null;
  }
};

export const getAutomationLogs = async () => {
  try {
    const { data, error } = await supabase
      .from("automation_logs")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(
      "Get Automation Logs Error:",
      error.message
    );
    return [];
  }
};