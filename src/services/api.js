// src/services/api.js
import axios from "axios";

// Create axios instance
const API = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:5000/api",
});

// Set token in headers
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

// POST FormData helper
export const postFormData = async (url, formData) => {
  return API.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default API;
