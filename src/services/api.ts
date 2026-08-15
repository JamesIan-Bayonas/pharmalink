import axios, { type AxiosInstance, type InternalAxiosRequestConfig, AxiosError } from 'axios';

// 1. Read Railway URL from Vercel env variable, fallback to localhost only in local development
const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5297';
const API_BASE_URL = `${rawBaseUrl.replace(/\/+$/, '')}/api`;

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor (JWT Token)
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

// Response Interceptor
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