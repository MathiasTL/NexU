import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/features/auth/services/auth.service';
export const AuthContext = createContext(null);
const STORAGE_KEY = 'smart_user';
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            }
            catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);
    const login = useCallback(async (email, password) => {
        const authUser = await authService.login(email, password);
        setUser(authUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
        return authUser;
    }, []);
    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);
    return (_jsx(AuthContext.Provider, { value: { user, isAuthenticated: !!user, isLoading, login, logout }, children: children }));
};
