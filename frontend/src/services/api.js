import axios from 'axios';

// Get API URL from env or fallback to local port 5000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const studentService = {
  register: async (studentData) => {
    const response = await api.post('/api/students/register', studentData);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/api/students');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/api/students/${id}`);
    return response.data;
  },
};

export const taskService = {
  getAll: async () => {
    const response = await api.get('/api/tasks');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  },
  create: async (taskData) => {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  },
  update: async (id, taskData) => {
    const response = await api.put(`/api/tasks/${id}`, taskData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data;
  },
};

export const dashboardService = {
  get: async (studentId) => {
    const response = await api.get(`/api/dashboard?student_id=${studentId}`);
    return response.data;
  },
};

export const noticeService = {
  getAll: async () => {
    const response = await api.get('/api/notices');
    return response.data;
  },
  create: async (noticeData) => {
    const response = await api.post('/api/notices', noticeData);
    return response.data;
  },
};

export const aiService = {
  generateStudyPlan: async (subject, deadline, taskTitle) => {
    const response = await api.post('/api/ai/study-plan', { subject, deadline, taskTitle });
    return response.data;
  },
  generateFlashcards: async (notesContent) => {
    const response = await api.post('/api/ai/flashcards', { notesContent });
    return response.data;
  },
  generateMCQs: async (notesContent) => {
    const response = await api.post('/api/ai/mcqs', { notesContent });
    return response.data;
  },
  summarizeNotice: async (noticeText) => {
    const response = await api.post('/api/ai/summarize', { noticeText });
    return response.data;
  },
  analyzeAttendance: async (subject, attendancePercentage) => {
    const response = await api.post('/api/ai/attendance', { subject, attendancePercentage });
    return response.data;
  },
};

export const automationService = {
  getLogs: async () => {
    const response = await api.get('/api/automation-logs');
    return response.data;
  },
};

export default api;
