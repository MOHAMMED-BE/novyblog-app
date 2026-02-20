import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useApi } from '@mbs-dev/api-request';
import api from '@/shared/api/api';
import { AUTH_KEYS } from '@/shared/constants/authKeys';
import { decrypt, encrypt } from 'shared/utils/storage/crypter';
import { toast } from 'sonner';
import { User, UserRole } from '@/types/auth';

export interface LoginResponse {
    accessToken: string;
    tokenType: 'Bearer' | string;
    expiresInSeconds: number;
    email: string;
    fullName: string;
    roles: UserRole[];
}

export type LoginResult = {
    token: string;
    user: User;
};

interface AuthContextType {
    token: string | null;
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    tokenReady: boolean;
    userReady: boolean;
    login: (email: string, password: string) => Promise<LoginResult>;
    logout: () => void;
    fetchMe: () => Promise<User>;
    setToken: (value: string | null) => Promise<void>;
    setUser: (value: User | null) => Promise<void>;
    clearAll: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Encrypted localStorage helpers ---
const setEncryptedItem = async (key: string, plain: unknown): Promise<void> => {
    if (plain === null || plain === undefined) {
        localStorage.removeItem(key);
        return;
    }
    const enc = await encrypt(JSON.stringify(plain), AUTH_KEYS.SECRET_KEY);
    localStorage.setItem(key, enc);
};

const getDecryptedItem = async <T,>(key: string): Promise<T | null> => {
    const enc = localStorage.getItem(key);
    if (!enc) return null;
    try {
        const raw = await decrypt(enc, AUTH_KEYS.SECRET_KEY);
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
};

type ApiErrorShape = {
    message?: string;
    response?: {
        data?: {
            message?: string;
            detail?: string;
        };
    };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { apiCall } = useApi(api);

    // Ready flags reflect hydration done
    const [tokenReady, setTokenReady] = useState(false);
    const [userReady, setUserReady] = useState(false);

    const [token, setTokenState] = useState<string | null>(null);
    const [user, setUserState] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);

    const setToken = async (value: string | null) => {
        await setEncryptedItem(AUTH_KEYS.TOKEN_KEY, value);
        setTokenState(value);
    };

    const setUser = async (value: User | null) => {
        await setEncryptedItem(AUTH_KEYS.USER_KEY, value);
        setUserState(value);
    };

    const fetchMe = async (): Promise<User> => {
        const response = await apiCall({
            url: '/me',
            method: 'GET',
            requiresAuth: true,
        });

        return response.data as User;
    };

    const extractMessage = (err: unknown) => {
        const e = err as ApiErrorShape;
        return (
            e?.message ||
            e?.response?.data?.message ||
            e?.response?.data?.detail ||
            'auth.login_failed'
        );
    };

    const login = async (email: string, password: string): Promise<LoginResult> => {
        setLoading(true);
        try {
            const loginResponse = await apiCall({
                url: '/auth/login',
                method: 'POST',
                data: { email, password },
                requiresAuth: false,
            });

            const data = loginResponse?.data as LoginResponse | undefined;

            if (!data?.accessToken) {
                throw new Error('tokens is missing');
            }

            toast.success('success');

            await setToken(data.accessToken);

            const userData = await fetchMe();
            await setUser(userData);

            return { token: data.accessToken, user: userData };
        } catch (error: unknown) {
            const e = error as ApiErrorShape;

            if (e?.response) {
                throw error;
            }

            throw new Error(extractMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const clearAll = () => {
        localStorage.removeItem(AUTH_KEYS.TOKEN_KEY);
        localStorage.removeItem(AUTH_KEYS.USER_KEY);
        localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN_KEY);
    };

    const logout = () => {
        setUserState(null);
        setTokenState(null);
        clearAll();
    };

    // ✅ Single hydration effect (deduped, no role gating)
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const [storedToken, storedUser] = await Promise.all([
                    getDecryptedItem<string>(AUTH_KEYS.TOKEN_KEY),
                    getDecryptedItem<User>(AUTH_KEYS.USER_KEY),
                ]);

                if (!mounted) return;

                if (storedToken) setTokenState(storedToken);
                if (storedUser) setUserState(storedUser);
            } finally {
                if (mounted) {
                    setTokenReady(true);
                    setUserReady(true);
                }
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                loading,
                tokenReady,
                userReady,
                isAuthenticated,
                login,
                fetchMe,
                logout,
                setToken,
                setUser,
                clearAll,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuthContext(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }
    return context;
}