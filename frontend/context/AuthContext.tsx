import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { v7 as uuidv7 } from 'uuid';
import { SignJWT } from 'jose';

interface AuthContextType {
    token: string | null
    isAuthenticated: boolean
    login: (token: string) => void
    logout: () => void
    getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    isAuthenticated: false,
    login: () => { },
    logout: () => { },
    getToken: () => Promise.resolve(null),
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const STORAGE_PREFIX = 'customer-assist-';
    const TOKEN_KEY = `${STORAGE_PREFIX}token`;

    const [token, setToken] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const getToken = async (): Promise<string | null> => {
        const existingToken = localStorage.getItem(TOKEN_KEY);
        if (existingToken) {
            return existingToken;
        }

        try {
            // In a real implementation, the server would sign this token
            // This is just for demo/PoC purposes
            const newToken = await new SignJWT({ sub: '1', name: 'John Doe' })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('7d')
                .sign(new TextEncoder().encode('demo-secret-key'));

            localStorage.setItem(TOKEN_KEY, newToken);
            return newToken;
        } catch (error) {
            console.error('Failed to generate token:', error);
            return null;
        }
    }

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = await getToken();

            if (storedToken) {
                setToken(storedToken);
                setIsAuthenticated(true);
            }
        };

        initializeAuth();
    }, []);

    const login = (newToken: string) => {
        localStorage.setItem(TOKEN_KEY, newToken);
        setToken(newToken);
        setIsAuthenticated(true);
    }

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setIsAuthenticated(false);
    }

    return (
        <AuthContext.Provider value={{
            token,
            isAuthenticated,
            login,
            logout,
            getToken,
        }}>
            {children}
        </AuthContext.Provider>
    )
} 