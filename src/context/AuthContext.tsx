import { useState, type ReactNode } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import { AuthContext, type AuthUser } from './authStore';

interface AuthClaims {
    uid?: string;
    role?: string;
    sub?: string;
    unique_name?: string;
    name?: string;
    exp?: number;
}

function userFromToken(token: string): AuthUser | null {
    try {
        const claims = jwtDecode<AuthClaims>(token);
        const id = Number(claims.uid);
        const username = claims.sub || claims.unique_name || claims.name;
        if (!Number.isSafeInteger(id) || id <= 0 || !username ||
            (claims.role !== 'Admin' && claims.role !== 'Pharmacist') ||
            !claims.exp || claims.exp * 1000 <= Date.now()) return null;

        return { id, username, role: claims.role };
    } catch {
        return null;
    }
}

function savedUser(): AuthUser | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const user = userFromToken(token);
    if (!user) localStorage.removeItem('token');
    return user;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(savedUser);

    const login = async (username: string, password: string) => {
        try {
            const response = await api.post<{ token: string }>('/Auth/login', { username, password });
            const token = response.data.token;
            const authenticatedUser = userFromToken(token);
            if (!authenticatedUser) return { success: false, message: 'The server returned an invalid session. Please try again.' };

            localStorage.setItem('token', token);
            setUser(authenticatedUser);
            return { success: true };
        } catch (error: unknown) {
            const message = axios.isAxiosError(error) && typeof error.response?.data?.message === 'string'
                ? error.response.data.message
                : 'Login failed. Please try again.';
            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
