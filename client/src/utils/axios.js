import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_BASE_URI || "http://localhost:5000",
  withCredentials: true,
});
