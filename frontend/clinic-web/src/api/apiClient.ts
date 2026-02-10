import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5219/api", // backend
});

// Ajoute automatiquement le token s'il existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
