import axios from "axios";

const API_BASE = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiService = {
  // Auth
  login: async (email, password, role) => {
    const res = await api.post("/auth/login", { email, password, role });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post("/auth/register", userData);
    return res.data;
  },

  // Startups
  getStartups: async (params) => {
    const res = await api.get("/startups", { params });
    return res.data;
  },
  getStartup: async (name) => {
    const res = await api.get(`/startups/${encodeURIComponent(name)}`);
    return res.data;
  },
  updateStartup: async (name, updatedFields) => {
    const res = await api.put(`/startups/${encodeURIComponent(name)}`, updatedFields);
    return res.data;
  },
  predictSuccess: async (name, fields) => {
    const res = await api.post(`/startups/${encodeURIComponent(name)}/predict-success`, fields);
    return res.data;
  },
  getPredictionStatus: async (name) => {
    const res = await api.get(`/startups/${encodeURIComponent(name)}/predict-success`);
    return res.data;
  },

  // Tasks
  getTasks: async (userId) => {
    const res = await api.get(`/tasks/${userId}`);
    return res.data;
  },
  addTask: async (taskData) => {
    const res = await api.post("/tasks", taskData);
    return res.data;
  },
  toggleTask: async (taskId) => {
    const res = await api.post(`/tasks/${taskId}/toggle`);
    return res.data;
  },

  // Messages
  getMessages: async (userId) => {
    const res = await api.get(`/messages/${userId}`);
    return res.data;
  },
  sendMessage: async (msgData) => {
    const res = await api.post("/messages", msgData);
    return res.data;
  },

  // Meetings
  getMeetings: async (userId) => {
    const res = await api.get(`/meetings/${userId}`);
    return res.data;
  },
  addMeeting: async (meetData) => {
    const res = await api.post("/meetings", meetData);
    return res.data;
  },
};
