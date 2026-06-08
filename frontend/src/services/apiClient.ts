import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach Authorization Bearer token if it exists in local storage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 Unauthorized errors and extract standard messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    if (status === 401) {
      // Clear authentication state and redirect on 401 Unauthorized
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Prevent infinite redirect loops if we are already on the login page
      if (!window.location.pathname.endsWith("/login")) {
        window.location.href = "/login";
      }
    }

    // Extract the API custom error message if available
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred";

    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
