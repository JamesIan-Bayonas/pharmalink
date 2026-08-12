import axios, { type AxiosInstance, type InternalAxiosRequestConfig, AxiosError } from 'axios';

// Create the Axios Instance using Vite Environment Variable
const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5297/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor (Attaches Bearer Token)
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }   
        return config;
    },
    (error: AxiosError) => Promise.reject(error)    
);

// Response Interceptor (Handles Unauthenticated Session Expiration)
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const isAuthRequest = error.config?.url?.toLowerCase().includes('/auth/login');

        if (error.response && error.response.status === 401 && !isAuthRequest) {
            console.warn("Session expired. Redirecting to login...");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;