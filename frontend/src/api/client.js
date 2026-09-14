import axios from "axios";

// Use same-origin /api proxy during Vite dev or fallback to IPv4 127.0.0.1:8000
// const API_BASE = (typeof window !== "undefined" && window.location.port === "5173") ? "/api" : "http://127.0.0.1:8000/api";
const API_BASE = "https://studyvault-ai-production-504f.up.railway.app/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("studyvault_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (data) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
  updateSemester: (current_semester) => api.put("/auth/semester", { current_semester }),
  updateBranch: (branch) => api.put("/auth/branch", { branch }),
  resetPassword: (email, new_password) => api.post("/auth/reset-password", { email, new_password }),
  getRecentStudents: () => api.get("/auth/recent-students"),
};

export const libraryApi = {
  getSemesters: () => api.get("/library/semesters"),
  createSubject: (data) => api.post("/library/subjects", data),
  getSubjectDocuments: (subjectId, params) => api.get(`/library/subjects/${subjectId}/documents`, { params }),
  uploadDocument: (formData) => api.post("/library/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  updateDocument: (docId, data) => api.put(`/library/documents/${docId}`, data),
  deleteDocument: (docId) => api.delete(`/library/documents/${docId}`),
  getStats: () => api.get("/library/stats"),
  getPdfUrl: (docId) => `${API_BASE}/library/documents/${docId}/view`,
};

export const notesApi = {
  getNotes: (params) => api.get("/quick-notes/", { params }),
  createNote: (data) => api.post("/quick-notes/", data),
  updateNote: (id, data) => api.put(`/quick-notes/${id}`, data),
  deleteNote: (id) => api.delete(`/quick-notes/${id}`),
  getCategories: () => api.get("/quick-notes/categories"),
};

export const coreApi = {
  getCoreKnowledge: (params) => api.get("/core-knowledge/", { params }),
  createCoreKnowledge: (data) => api.post("/core-knowledge/", data),
  updateCoreKnowledge: (id, data) => api.put(`/core-knowledge/${id}`, data),
  deleteCoreKnowledge: (id) => api.delete(`/core-knowledge/${id}`),
  getTopics: () => api.get("/core-knowledge/topics"),
};

export const resourcesApi = {
  getResources: (params) => api.get("/resources/", { params }),
  createResource: (data) => api.post("/resources/", data),
  updateResource: (id, data) => api.put(`/resources/${id}`, data),
  deleteResource: (id) => api.delete(`/resources/${id}`),
};

export const searchApi = {
  globalSearch: (q) => api.get("/search/", { params: { q } }),
};

export const aiApi = {
  askQuestion: (data) => api.post("/ai/ask", data),
  saveToKnowledge: (data) => api.post("/ai/save-to-knowledge", data),
  generateRevision: (data) => api.post("/ai/revision", data),
  generateQuiz: (data) => api.post("/ai/quiz", data),
  getEngineStatus: () => api.get("/ai/engine-status"),
  updateEngineConfig: (data) => api.put("/ai/engine-config", data),
};

export default api;
