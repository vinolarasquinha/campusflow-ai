import React, { createContext, useContext, useState, useEffect } from 'react';
import { studentService } from '../services/api';
import { toast } from 'react-hot-toast';

const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  const [activeStudent, setActiveStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all registered students
  const fetchStudents = async () => {
    try {
      const data = await studentService.getAll();
      if (data.success) {
        setStudents(data.students || []);
        return data.students || [];
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
    return [];
  };

  // On mount: load active student from localStorage and load all students
  useEffect(() => {
    const initializeStudent = async () => {
      setLoading(true);
      const studentList = await fetchStudents();
      
      const storedId = localStorage.getItem('cf_student_id');
      if (storedId && studentList.length > 0) {
        const found = studentList.find(s => s.id === storedId);
        if (found) {
          setActiveStudent(found);
        } else {
          // If stored student no longer exists, clear storage
          localStorage.removeItem('cf_student_id');
        }
      }
      setLoading(false);
    };

    initializeStudent();
  }, []);

  // Register new student
  const register = async (studentData) => {
    try {
      setLoading(true);
      const data = await studentService.register(studentData);
      if (data.success && data.student) {
        setActiveStudent(data.student);
        localStorage.setItem('cf_student_id', data.student.id);
        toast.success('Registration successful! Welcome to CampusFlow.');
        await fetchStudents();
        return { success: true, student: data.student };
      } else {
        toast.error(data.message || 'Registration failed');
        return { success: false };
      }
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || 'Error connecting to server';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Switch/Login to an existing student profile
  const switchStudent = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setActiveStudent(student);
      localStorage.setItem('cf_student_id', student.id);
      toast.success(`Switched workspace to ${student.name}`);
      return true;
    }
    toast.error('Student profile not found');
    return false;
  };

  // Logout / clear active student profile
  const logout = () => {
    setActiveStudent(null);
    localStorage.removeItem('cf_student_id');
    toast.success('Signed out of profile');
  };

  return (
    <StudentContext.Provider
      value={{
        activeStudent,
        students,
        loading,
        register,
        switchStudent,
        logout,
        refreshStudents: fetchStudents,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
