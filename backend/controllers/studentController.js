import supabase from "../config/supabase.js";

/**
 * POST /api/students/register
 */
export const registerStudent = async (req, res) => {
  try {
    const {
      name,
      branch,
      year,
      email,
      phone,
      subjects,
      google_email,
    } = req.body;

    // Validation
    if (!name || !branch || !year || !email || !phone) {
      return res.status(400).json({
        success: false,
        message:
          "Name, branch, year, email and phone are required",
      });
    }

    // Check if student already exists
    const { data: existingStudent, error: findError } = await supabase
      .from("students")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Student already registered",
      });
    }

    // Insert student
    const { data, error } = await supabase
      .from("students")
      .insert([
        {
          name,
          branch,
          year,
          email,
          phone,
          subjects: subjects || [],
          google_email: google_email || email,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      student: data,
    });
  } catch (error) {
    console.error("Register Student Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register student",
      error: error.message,
    });
  }
};

/**
 * GET /api/students
 */
export const getAllStudents = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      students: data,
    });
  } catch (error) {
    console.error("Get Students Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

/**
 * GET /api/students/:id
 */
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      student: data,
    });
  } catch (error) {
    console.error("Get Student Error:", error);

    return res.status(404).json({
      success: false,
      message: "Student not found",
      error: error.message,
    });
  }
};