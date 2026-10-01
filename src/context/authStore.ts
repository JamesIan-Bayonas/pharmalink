import { createContext } from 'react';

export interface AuthUser {
    id: number;
    username: string;
    role: 'Admin' | 'Pharmacist';
}

export interface AuthContextValue {
    user: AuthUser | null;
    login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
