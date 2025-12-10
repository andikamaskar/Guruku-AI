import axios from "axios";
import API_BASE_URL from "@/config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;
