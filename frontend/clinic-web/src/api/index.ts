// src/api/index.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5219/api",
  timeout: 10000,
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error("API error:", err);
    return Promise.reject(err);
  }
);
